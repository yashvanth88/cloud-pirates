Deployment quickstart
--------------------

This file describes the minimal steps to deploy the application to your Civo Kubernetes cluster and get the external endpoint.

Prerequisites
- `civo` CLI installed and `CIVO_API_KEY` available
- `kubectl` installed and configured
- `docker` installed locally (for local pushes), or GitHub Actions configured to push to a registry

1) Add GitHub repository secrets

Required secrets:
- `CIVO_API_KEY` — your Civo API token
- `CIVO_CLUSTER_NAME` — cluster name
- `DOCKER_REGISTRY_USERNAME` and `DOCKER_REGISTRY_PASSWORD` — registry creds (GHCR or Docker Hub)
- `DOCKER_REGISTRY_HOST` — optional, default `ghcr.io`
- `REGISTRY_OWNER` — optional, your org/user for image path
- `SPACES_KEY` and `SPACES_SECRET` — MinIO / S3 creds (if used)
- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string

2) Option A — Deploy via GitHub Actions (recommended)

- Push your changes to `main`. The workflow `.github/workflows/deploy-to-civo.yml` will:
  - build and push `backend` and `frontend` images to your registry
  - install Postgres and Redis via Helm
  - apply `k8s/minio-deployment.yaml`, `k8s/backend-deployment.yaml`, and `k8s/frontend-deployment.yaml`

Monitor the workflow in the Actions tab. After completion run:

```bash
kubectl --kubeconfig ~/.kube/config get svc pirates-backend pirates-frontend -o wide
```

Wait until `EXTERNAL-IP` appears for both services. The frontend will be reachable at `http://<FRONTEND_IP>`.

3) Option B — Manual local deploy (quick)

Build and push images (example GHCR):

```bash
# Backend
docker build -t ghcr.io/<you>/cloud-pirates-backend:latest -f backend/Dockerfile backend
docker push ghcr.io/<you>/cloud-pirates-backend:latest

# Frontend
docker build -t ghcr.io/<you>/cloud-pirates-frontend:latest -f frontend/Dockerfile frontend
docker push ghcr.io/<you>/cloud-pirates-frontend:latest
```

Save kubeconfig and apply manifests:

```bash
export CIVO_API_KEY="..."
civo --access-token "$CIVO_API_KEY" kubernetes kubeconfig save <YOUR_CLUSTER_NAME> --dir ~/.kube --overwrite
export KUBECONFIG=~/.kube/config

kubectl apply -f k8s/minio-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Update images if needed
kubectl set image deployment/pirates-backend backend=ghcr.io/<you>/cloud-pirates-backend:latest
kubectl set image deployment/pirates-frontend frontend=ghcr.io/<you>/cloud-pirates-frontend:latest

kubectl rollout status deployment/pirates-backend
kubectl rollout status deployment/pirates-frontend
kubectl get svc pirates-backend pirates-frontend -o wide
```

4) Create `pirates-secrets` in-cluster (if not already)

```bash
kubectl create secret generic pirates-secrets \
  --from-literal=SPACES_KEY=<minio-user> \
  --from-literal=SPACES_SECRET=<minio-pass> \
  --from-literal=SPACES_ENDPOINT=http://pirates-minio:9000 \
  --from-literal=SPACES_BUCKET=pirates-scans
```

5) Verify end-to-end

- Open frontend IP in browser
- Create EMR, upload a scan, and observe backend logs for processing
- Tail backend logs:

```bash
kubectl logs -l app=pirates-backend -c backend -f
```

If anything fails, copy the relevant pod logs and I can help diagnose.
