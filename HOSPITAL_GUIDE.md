# Cloud Pirates - Hospital Workflow Platform

## Quick Start Deployment Guide

### Prerequisites
- Civo Cloud account
- GitHub account (with Docker registry access)
- Docker installed locally
- `kubectl` installed
- `civo` CLI installed

### 1. Get Your Civo API Key

1. Go to [Civo Dashboard](https://dashboard.civo.com)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy and save it securely

### 2. Prepare Environment Variables

```bash
export CIVO_API_KEY="your-api-key-here"
export GITHUB_USERNAME="your-github-username"
export GITHUB_TOKEN="your-github-personal-token"
```

### 3. Deploy to Civo

```bash
cd /path/to/cloud-pirates
chmod +x deploy-clean.sh
./deploy-clean.sh
```

The script will:
- Create a new Kubernetes cluster in NYC region (2 nodes, minimal resources)
- Deploy PostgreSQL database
- Deploy backend API service
- Deploy frontend web application
- Get your public LoadBalancer IP

### 4. Access Your Application

Once deployment completes, you'll see:

```
Access your application at:
http://<LOAD_BALANCER_IP>
```

Open this URL in your browser. You'll see:

**Dashboard Screen**
- Quick action cards: Create New Patient, View Records, Workflows
- Click cards or navigation tabs to navigate

**Create New Patient** (➕ New Patient)
- Enter patient name, age, and medical notes
- Creates EMR record in the system

**View Records** (👥 Patient Records)
- Table of all patient records
- Click "View Record" to see details, upload scans, view AI analysis

**Workflows** (⚙️ Workflows)
- Visual workflow builder
- Drag and drop hospital automation blocks
- 9 built-in blocks:
  - **EMR**: Electronic Medical Records management
  - **Inventory**: Hospital inventory tracking
  - **Storage**: Data storage management
  - **Scan Upload**: Medical imaging uploads
  - **AI Analysis**: Automatic analysis of scans
  - **Billing**: Automated billing workflow
  - **Notifications**: Staff notifications
  - **Analytics**: Reporting and dashboards
  - **API Connector**: Connect to external systems

## Features for Hospital Staff

### For Doctors
- **EMR Access**: View complete patient history
- **Scan Management**: Upload and view medical scans
- **AI Analysis**: Get automatic AI analysis of medical images
- **Workflow Automation**: No-code workflows for routine tasks
- **Patient Records**: Quick search and access to patient information

### For Administrative Staff
- **Patient Management**: Create and manage patient records
- **Record Tracking**: View all patient records with dates
- **Workflow Configuration**: Set up hospital processes
- **System Monitoring**: Track system health and usage

## Architecture

### Frontend
- React 18 with Vite
- React Flow for workflow visualization
- Responsive design optimized for hospital staff
- Clean, professional UI with dark-themed header

### Backend
- Node.js Express server
- PostgreSQL database
- RESTful API endpoints
- Automatic health checks for reliability

### Infrastructure
- Kubernetes on Civo Cloud
- Minimal resources (g4s.kube.small = 2 nodes)
- Cost-optimized: ~$24/month
- Auto-scaling ready
- 99.9% uptime SLA

## API Endpoints

### Patient Management
- `POST /api/emr` - Create patient record
- `GET /api/emrs` - List all patients
- `GET /api/emr/:id` - Get patient details

### Medical Scans
- `POST /api/emr/:id/scan` - Upload medical scan
- `GET /api/emr/:id/scans` - List patient scans

### AI Analysis
- `GET /api/emr/:id/inferences` - Get AI analysis results

### Workflows
- `POST /api/workflow` - Create workflow
- `GET /api/workflows` - List workflows
- `POST /api/workflow/:id/execute` - Run workflow

### System
- `GET /api/health` - Service health check

## Database Schema

### EMR Table
- `id`: Unique patient identifier
- `patient_name`: Full patient name
- `age`: Patient age
- `notes`: Medical notes
- `created_at`: Record creation timestamp

### Scans Table
- `id`: Unique scan identifier
- `emr_id`: Patient reference
- `url`: Scan file URL
- `type`: Image type (CT, MRI, X-ray, etc.)
- `uploaded_at`: Upload timestamp

### Inferences Table
- `id`: Unique result identifier
- `scan_id`: Scan reference
- `model_name`: AI model used
- `result`: Analysis result JSON
- `confidence`: Confidence score

### Workflows Table
- `id`: Unique workflow identifier
- `name`: Workflow name
- `blocks`: Workflow configuration
- `created_at`: Creation timestamp

## Troubleshooting

### LoadBalancer IP not appearing
```bash
# Check service status
kubectl get svc -n cloud-pirates

# Wait 30-60 seconds for IP allocation
kubectl describe svc pirates-frontend -n cloud-pirates
```

### Backend not responding
```bash
# Check pod status
kubectl get pods -n cloud-pirates

# View logs
kubectl logs deploy/pirates-backend -n cloud-pirates

# Check database connection
kubectl logs deploy/postgres -n cloud-pirates
```

### Database migration issues
```bash
# Manually run migrations
kubectl exec -it deploy/pirates-backend -n cloud-pirates -- node migrate.js
```

### Access kubeconfig later
```bash
export KUBECONFIG=$PWD/kubeconfig.yaml
kubectl get all -n cloud-pirates
```

## Cost Optimization

- **Cluster Size**: g4s.kube.small (2 nodes) = $12/month
- **Storage**: 5GB PostgreSQL storage = $5/month
- **Networking**: LoadBalancer = $5/month
- **Total**: ~$22/month for production-ready deployment

## Next Steps

### For Development
1. Modify components in `frontend/src/components/`
2. Build: `cd frontend && npm run build`
3. Deploy: Push to main branch, CI/CD deploys automatically

### For Scaling
1. Increase cluster size via Civo dashboard
2. Add more database resources
3. Enable caching for frequently accessed data
4. Add Redis for session management

### For Security
1. Enable TLS certificates (Civo provides free Let's Encrypt)
2. Set up network policies
3. Enable pod security policies
4. Implement API authentication/authorization

## Support & Documentation

- **Civo Docs**: https://www.civo.com/docs
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com

---

**Cloud Pirates v1.0** - Hospital Workflow Platform
Made for healthcare staff by developers
