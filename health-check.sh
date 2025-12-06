#!/bin/bash

# Health check script for Cloud Pirates deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Cloud Pirates Health Check ===${NC}\n"

# Check kubeconfig
if [ -z "$KUBECONFIG" ]; then
    echo -e "${YELLOW}KUBECONFIG not set. Looking for kubeconfig.yaml...${NC}"
    if [ -f "kubeconfig.yaml" ]; then
        export KUBECONFIG=$PWD/kubeconfig.yaml
        echo -e "${GREEN}✓ Using kubeconfig.yaml${NC}"
    else
        echo -e "${RED}✗ kubeconfig.yaml not found${NC}"
        exit 1
    fi
fi

# Check cluster connectivity
echo -e "${YELLOW}Checking cluster connectivity...${NC}"
if kubectl cluster-info &>/dev/null; then
    echo -e "${GREEN}✓ Cluster connection OK${NC}"
else
    echo -e "${RED}✗ Cannot connect to cluster${NC}"
    exit 1
fi

echo ""

# Check namespace
echo -e "${YELLOW}Checking cloud-pirates namespace...${NC}"
if kubectl get ns cloud-pirates &>/dev/null; then
    echo -e "${GREEN}✓ Namespace exists${NC}"
else
    echo -e "${RED}✗ Namespace not found${NC}"
    exit 1
fi

echo ""

# Check deployments
echo -e "${YELLOW}Deployment Status:${NC}"
kubectl get deployments -n cloud-pirates

echo ""

# Check pods
echo -e "${YELLOW}Pod Status:${NC}"
kubectl get pods -n cloud-pirates

echo ""

# Check services
echo -e "${YELLOW}Service Status:${NC}"
kubectl get svc -n cloud-pirates

echo ""

# Check LoadBalancer IP
echo -e "${YELLOW}Getting LoadBalancer IP...${NC}"
LB_IP=$(kubectl get svc pirates-frontend -n cloud-pirates -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -n "$LB_IP" ]; then
    echo -e "${GREEN}✓ LoadBalancer IP: $LB_IP${NC}"
    echo -e "   URL: http://$LB_IP"
else
    echo -e "${YELLOW}⏳ LoadBalancer IP not yet assigned${NC}"
fi

echo ""

# Check backend health
echo -e "${YELLOW}Checking backend API...${NC}"
BACKEND_IP=$(kubectl get svc pirates-backend -n cloud-pirates -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
if kubectl exec -it deploy/pirates-backend -n cloud-pirates -- curl -s http://localhost:3000/health &>/dev/null; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⏳ Backend API not yet ready${NC}"
fi

echo ""

# Check database
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if kubectl get pods -n cloud-pirates | grep -q postgres; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found${NC}"
fi

echo ""

# Recent logs
echo -e "${YELLOW}Recent Backend Logs:${NC}"
kubectl logs deploy/pirates-backend -n cloud-pirates --tail=5 2>/dev/null || echo "No logs available yet"

echo ""
echo -e "${GREEN}=== Health Check Complete ===${NC}"
