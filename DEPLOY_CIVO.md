# Deploying Cloud Pirates to Civo Kubernetes

This guide maps the project to a Civo Kubernetes cluster. It is cloud-agnostic Kubernetes YAML and works on any K8s cluster; it includes Civo-specific commands where useful.

Goals
- Run the web service and a separate worker in a Kubernetes cluster
- Run DB migrations as a Job
- Keep secrets (DATABASE_URL, REDIS_URL, S3/Spaces creds) in Kubernetes Secrets

Prerequisites
- `civo` CLI installed and authenticated (https://www.civo.com/docs/cli)
- `kubectl` installed
- A container registry (Docker Hub, GitHub Packages, or other) to push images

High level steps
1) Build and push container image
2) Create a Civo Kubernetes cluster and configure kubectl
3) Create Kubernetes Secret with env vars
4) Run DB migration Job once
5) Deploy web + worker manifests
6) (Optional) add Redis and object storage

Commands (example)

1) Build and publish images
```bash
# from repo root
# tag with your registry (Docker Hub example)
docker build -t <YOUR_REGISTRY>/cloud-pirates:latest .
docker push <YOUR_REGISTRY>/cloud-pirates:latest
```

2) Create a Civo Kubernetes cluster
```bash
# create a small cluster (example)
civo kubernetes create cloud-pirates --size g3.k3s.medium --nodes 2 --wait
# get kubeconfig
civo kubernetes config cloud-pirates --save --local
# or use 'civo kubernetes config cloud-pirates' to print the config
kubectl config use-context cloud-pirates
```

3) Create secrets (replace values)
```bash
kubectl create secret generic cloud-pirates-secrets \
  --from-literal=DATABASE_URL='postgres://user:pass@host:5432/dbname' \
  --from-literal=SPACES_ENDPOINT='nyc3.digitaloceanspaces.com' \
  --from-literal=SPACES_KEY='...' \
  --from-literal=SPACES_SECRET='...' \
  --from-literal=SPACES_BUCKET='cloud-pirates' \
  --from-literal=INFERENCE_URL='http://inference-proxy:5000/predict' \
  --from-literal=REDIS_URL='redis://redis:6379'
```

4) Run DB migration job
```bash
# edit k8s/migrate-job.yaml to point to your image if you didn't use the same tag
kubectl apply -f k8s/migrate-job.yaml
# watch job
kubectl get jobs
kubectl logs -l job-name=cloud-pirates-migrate --tail=200
```

5) Deploy web + worker
```bash
# edit k8s/deployment.yaml to replace <YOUR_REGISTRY> with your image registry
kubectl apply -f k8s/deployment.yaml
# check pods and services
kubectl get pods -w
kubectl get svc
```

6) (Optional) Redis & object storage
- Redis: you can run a Redis deployment in-cluster or use a managed Redis. For testing you can `kubectl create deployment redis --image=redis` and expose it.
- Object storage: use a cloud S3 compatible storage (eg. Civo doesn't provide S3; use Backblaze/Wasabi/MinIO). For production, use a managed object store and set `SPACES_*` accordingly.

Notes
- The deployments currently mount an ephemeral `emptyDir` for uploads — for production you should use S3-compatible storage and not rely on node-local storage.
- The worker connects to Redis if `REDIS_URL` is provided; otherwise it falls back to an in-process queue.
- Update `k8s/secret-example.yaml` with your real values or create secrets using `kubectl create secret` as shown.

If you want, I can:
- Replace `<YOUR_REGISTRY>` in the manifests with your registry and push images for you, or
- Create a small CI workflow (GitHub Actions) that builds and pushes images and runs `kubectl apply` to the Civo cluster on push.

Which would you like next?