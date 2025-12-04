#!/usr/bin/env bash
set -euo pipefail

# Deploy helper: builds, tags, pushes backend image and applies k8s manifest.
# Defaults to GitHub Container Registry (GHCR). Update REGISTRY and IMAGE if needed.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null && pwd)"
cd "$ROOT_DIR"

IMAGE_NAME="ghcr.io/$GITHUB_ACTOR/cloud-pirates-backend"
TAG="latest"

if [ -n "${1-}" ]; then
  IMAGE_NAME="$1"
fi
if [ -n "${2-}" ]; then
  TAG="$2"
fi

echo "Building backend image: $IMAGE_NAME:$TAG"
docker build -t "$IMAGE_NAME:$TAG" -f backend/Dockerfile .

echo "Pushing image"
docker push "$IMAGE_NAME:$TAG"

echo "Updating k8s manifest with image"
sed -i.bak "s|ghcr.io/YOUR_GH_USER/cloud-pirates-backend:latest|$IMAGE_NAME:$TAG|g" k8s/backend-deployment.yaml

echo "Applying k8s manifest"
kubectl apply -f k8s/backend-deployment.yaml

echo "Done. Run 'kubectl rollout status deployment/pirates-backend' to follow progress."
