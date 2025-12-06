#!/bin/bash
# Manual deployment script for MUM1 region

set -e

export CIVO_API_KEY="85jbKE7jZjI7PGLBsTVrdheT28m5SibSWhQdorpUC3LO1YNTC9"
CLUSTER_NAME="cloud-pirates-cluster-mum1"
REGION="mum1"

echo "=== Cloud Pirates MUM1 Deployment Script ==="
echo "Cluster: $CLUSTER_NAME"
echo "Region: $REGION"

# Step 1: Get cluster information via Civo CLI with verbose error handling
echo ""
echo "Step 1: Retrieving cluster information..."
CLUSTER_INFO=$(civo kubernetes show $CLUSTER_NAME 2>&1 || true)
echo "Cluster info retrieved"

# Step 2: Retrieve and save kubeconfig - try all methods
echo "Step 2: Retrieving kubeconfig..."
mkdir -p $HOME/.kube

# Method 1: Direct stdout
if civo kubernetes config $CLUSTER_NAME > $HOME/.kube/config 2>/dev/null; then
  echo "✓ Kubeconfig retrieved successfully (method: stdout)"
elif civo kubernetes config $CLUSTER_NAME --save 2>/dev/null; then
  echo "✓ Kubeconfig saved (method: --save)"
elif civo kubernetes config $CLUSTER_NAME --save --merge 2>/dev/null; then
  echo "✓ Kubeconfig merged (method: --save --merge)"
else
  echo "ERROR: Could not retrieve kubeconfig"
  echo "Cluster info: $CLUSTER_INFO"
  exit 1
fi

chmod 600 $HOME/.kube/config

# Step 3: Verify kubectl connectivity
echo "Step 3: Verifying kubectl access..."
kubectl cluster-info || {
  echo "ERROR: kubectl cannot access cluster"
  exit 1
}

# Step 4: Create secrets
echo "Step 4: Creating Kubernetes secrets..."
kubectl create secret generic pirates-secrets \
  --from-literal=DATABASE_URL='postgres://postgres:KwkfyoDHnv@pirates-postgres-postgresql:5432/postgres' \
  --from-literal=SPACES_ENDPOINT='http://pirates-minio.default.svc.cluster.local:9000' \
  --from-literal=SPACES_KEY='minioaccess' \
  --from-literal=SPACES_SECRET='miniosecret123' \
  --from-literal=SPACES_BUCKET='pirates-scans' \
  --from-literal=REDIS_URL='redis://pirates-redis-master.default.svc.cluster.local:6379' \
  --from-literal=INFERENCE_URL='http://localhost:5000' \
  --dry-run=client -o yaml | kubectl apply -f -

# Step 5: Deploy backend and frontend
echo "Step 5: Deploying services..."
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Step 6: Wait for deployments
echo "Step 6: Waiting for deployments to be ready..."
kubectl rollout status deployment/pirates-backend --timeout=120s || true
kubectl rollout status deployment/pirates-frontend --timeout=120s || true

# Step 7: Get external IPs
echo "Step 7: Getting service URLs..."
sleep 10

FRONTEND_IP=$(kubectl get svc pirates-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
BACKEND_IP=$(kubectl get svc pirates-backend -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

echo ""
echo "=========================================="
echo "🚀 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo "Frontend URL: http://$FRONTEND_IP"
echo "Backend API: http://$BACKEND_IP/api"
echo "=========================================="
echo ""
echo "Services:"
kubectl get svc

