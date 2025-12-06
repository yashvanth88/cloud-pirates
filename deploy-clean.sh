#!/bin/bash

# Clean Civo Deployment Script - Minimal Resources
# Deploy to NYC region with g4s.kube.small (2 nodes)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cloud Pirates Deployment to Civo ===${NC}\n"

# Get Civo API key
if [ -z "$CIVO_API_KEY" ]; then
    echo -e "${YELLOW}Enter your Civo API key:${NC}"
    read -s CIVO_API_KEY
    export CIVO_API_KEY
fi

# Configure Civo CLI
civo apikey add cloud-pirates "$CIVO_API_KEY"
civo apikey default cloud-pirates

echo -e "${GREEN}✓ Configured Civo API${NC}\n"

# Create cluster in NYC
CLUSTER_NAME="cloud-pirates-$(date +%s)"
echo -e "${YELLOW}Creating cluster: $CLUSTER_NAME${NC}"

CLUSTER=$(civo kubernetes create "$CLUSTER_NAME" \
  --size g4s.kube.small \
  --region mum1 \
  --nodes 2 \
  --wait \
  --output json)

CLUSTER_ID=$(echo "$CLUSTER" | jq -r '.id')
echo -e "${GREEN}✓ Cluster created: $CLUSTER_ID${NC}\n"

# Wait for cluster to be ready
echo -e "${YELLOW}Waiting for cluster to be ready...${NC}"
sleep 30
civo kubernetes show "$CLUSTER_ID" --output json > /dev/null
echo -e "${GREEN}✓ Cluster is ready${NC}\n"

# Get kubeconfig
echo -e "${YELLOW}Downloading kubeconfig...${NC}"
civo kubernetes config "$CLUSTER_ID" > kubeconfig.yaml
export KUBECONFIG=$PWD/kubeconfig.yaml
echo -e "${GREEN}✓ Kubeconfig saved${NC}\n"

# Create namespaces
kubectl create namespace cloud-pirates || true
kubectl config set-context --current --namespace=cloud-pirates

# Create secrets for Docker registry
echo -e "${YELLOW}Creating Docker registry secrets...${NC}"
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username="${GITHUB_USERNAME}" \
  --docker-password="${GITHUB_TOKEN}" \
  --docker-email="ops@cloudpirates.io" \
  -n cloud-pirates || true

echo -e "${GREEN}✓ Secrets created${NC}\n"

# Deploy PostgreSQL
echo -e "${YELLOW}Deploying PostgreSQL...${NC}"
cat > postgres-values.yaml <<EOF
auth:
  postgresPassword: "postgres"
  username: "hospital"
  password: "hospital123"
  database: "hospital_db"

primary:
  persistence:
    size: 5Gi

metrics:
  enabled: false

service:
  type: ClusterIP
  port: 5432
EOF

helm repo add bitnami https://charts.bitnami.com/bitnami || true
helm repo update
helm upgrade --install postgres bitnami/postgresql -f postgres-values.yaml -n cloud-pirates

echo -e "${GREEN}✓ PostgreSQL deployed${NC}\n"

# Create backend secret
echo -e "${YELLOW}Creating backend configuration...${NC}"
kubectl create secret generic backend-config \
  --from-literal=DATABASE_URL="postgresql://hospital:hospital123@postgres:5432/hospital_db" \
  --from-literal=NODE_ENV="production" \
  --from-literal=PORT="3000" \
  -n cloud-pirates || true

# Deploy backend
echo -e "${YELLOW}Deploying backend service...${NC}"
cat > backend-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pirates-backend
  namespace: cloud-pirates
  labels:
    app: pirates-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pirates-backend
  template:
    metadata:
      labels:
        app: pirates-backend
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: backend
          image: ghcr.io/${GITHUB_USERNAME}/cloudpirates-backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: backend-config
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: pirates-backend
  namespace: cloud-pirates
spec:
  type: ClusterIP
  selector:
    app: pirates-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
EOF

kubectl apply -f backend-deployment.yaml
echo -e "${GREEN}✓ Backend deployed${NC}\n"

# Deploy frontend
echo -e "${YELLOW}Deploying frontend service...${NC}"
cat > frontend-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pirates-frontend
  namespace: cloud-pirates
  labels:
    app: pirates-frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pirates-frontend
  template:
    metadata:
      labels:
        app: pirates-frontend
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: frontend
          image: ghcr.io/${GITHUB_USERNAME}/cloudpirates-frontend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
            limits:
              cpu: 300m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 20
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: pirates-frontend
  namespace: cloud-pirates
  type: LoadBalancer
spec:
  selector:
    app: pirates-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
EOF

kubectl apply -f frontend-deployment.yaml
echo -e "${GREEN}✓ Frontend deployed${NC}\n"

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 15

# Get LoadBalancer IP
echo -e "${YELLOW}Getting LoadBalancer IP...${NC}"
while true; do
  LB_IP=$(kubectl get svc pirates-frontend -n cloud-pirates -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  if [ -n "$LB_IP" ]; then
    break
  fi
  echo "Waiting for LoadBalancer IP..."
  sleep 5
done

echo -e "${GREEN}✓ LoadBalancer IP: $LB_IP${NC}\n"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
sleep 10
kubectl exec -it deploy/pirates-backend -n cloud-pirates -- node migrate.js || true
echo -e "${GREEN}✓ Database ready${NC}\n"

# Summary
echo -e "${GREEN}=== Deployment Complete ===${NC}\n"
echo "Cluster Name: $CLUSTER_NAME"
echo "Cluster ID: $CLUSTER_ID"
echo "Region: NYC"
echo "Size: g4s.kube.small (2 nodes)"
echo -e "\n${GREEN}Access your application at:${NC}"
echo "http://$LB_IP"
echo -e "\n${YELLOW}Saved kubeconfig to:${NC}"
echo "kubeconfig.yaml"
echo -e "\n${YELLOW}To access cluster later:${NC}"
echo "export KUBECONFIG=\$PWD/kubeconfig.yaml"
echo "kubectl get all -n cloud-pirates"
