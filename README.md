# Cloud Pirates — Hospital No-Code Platform (MVP)

This repo contains a simple 48-hour MVP demonstrating a no-code workflow for hospitals: create EMR → upload scan → run mock inference → attach result to EMR → view in dashboard.

## Structure

- `backend/` — Express API, Dockerfile, DB schema
- `frontend/` — Vite + React frontend (EMRForm, ScanUpload, Dashboard)
- `docker-compose.yml` — local stack (Postgres + backend)

## Quick Start (local)

1. Copy env example: `cp backend/.env.example backend/.env` and update Spaces creds or set environment variables.
2. Start stack (requires Docker):

```bash
docker compose up --build
```

3. Install and run frontend (in another shell):

```bash
cd frontend
npm install
npm run dev
```

4. Open the frontend (Vite dev server URL). The frontend proxies `/api` to the backend using relative calls; when running locally you may need to configure a proxy or open the app and use `http://localhost:8080` for API calls.

## Backend endpoints

- `POST /emr` — create EMR, body `{ patient_name, age, notes }`.
- `POST /upload/:emrId` — upload `multipart/form-data` with `scan` file field.
- `POST /mock-infer` — returns a mock inference result.
- `GET /emr/:id` — returns EMR, scans, and inference records.

## DB schema
See `backend/db/schema.sql` for the minimal schema (tables: `emr`, `scans`, `inferences`).

## Deploy
For a demo you can build the backend image and run it on a droplet, or push to DigitalOcean Container Registry and deploy to App Platform. See the original plan for `doctl` commands.

## Next steps
- Add authentication and RBAC
- Replace mock-infer with a real ML container or external API
- Add FHIR/DICOM integration for production healthcare use
