# Deploying Cloud Pirates to DigitalOcean App Platform

This guide shows a minimal path to deploying the project (web + worker) and required resources.

Prerequisites
- `doctl` installed and authenticated: `doctl auth init`
- DigitalOcean account with access to App Platform and Managed Databases
- GitHub repo (preferred) containing this project (or you can deploy from local source using `doctl`)

Steps

1) Create Managed Postgres
- In the control panel: Databases → Create Database → PostgreSQL
- Note the connection string (DATABASE_URL)

2) Create a Space for uploads
- Control panel: Spaces → Create Space (choose region, public/private)
- Create an access key for the Space (SPACES_KEY / SPACES_SECRET) and note the endpoint and bucket name.

3) (Optional) Create a Redis instance (Managed or self-hosted)
- For production queue, create Managed Redis or use an external Redis provider. Note REDIS_URL.

4) Update `app.yaml`
- Open `app.yaml` and set `github.repo` to your GitHub `owner/repo` if deploying from GitHub.
- Alternatively, deploy from local using `doctl apps create --spec app.yaml` (see below).

5) Set environment variables in App Platform (via UI or in `app.yaml` envs)
- `DATABASE_URL`, `SPACES_ENDPOINT`, `SPACES_KEY`, `SPACES_SECRET`, `SPACES_BUCKET`, `INFERENCE_URL` (optional), `REDIS_URL` (optional)

6) Migrate database schema
- Locally (before deploy):
```bash
cd backend
export DATABASE_URL="postgres://..."
npm run migrate
```
- Or run the same migration step from a one-off droplet or via App Platform's console after deployment.

7) Deploy the app
- Deploy from GitHub (App Platform): link your repo, point to `app.yaml`, and deploy.
- Or use doctl (from repo root):
```bash
doctl apps create --spec app.yaml
```

8) Start worker
- If you set `REDIS_URL` and used the App Platform spec, the worker will be created by the spec and run `node backend/worker.js`.
- If you do not have Redis, the dev-server fallback in `dev-server.js` will still process jobs in-process.

Notes & next steps
- The `backend/migrate.js` script applies `db/schema.sql` to the Postgres instance.
- For production, use a managed Redis and the `backend/worker.js` process for robust job processing.
- Secure the API endpoints with authentication before exposing to production.

If you want, I can:
- Fill in your GitHub repo in `app.yaml` and create the App via `doctl` for you (I will need repo details and permission).
- Add a one-off `doctl` script to run migrations in the App Platform after deploy.
