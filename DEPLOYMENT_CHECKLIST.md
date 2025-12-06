# Cloud Pirates - Deployment Readiness Checklist

## Pre-Deployment Checklist

### ✅ Infrastructure Requirements
- [ ] Civo Cloud account created
- [ ] Civo API key generated and saved
- [ ] GitHub account with personal access token
- [ ] Docker installed locally (for manual builds)
- [ ] kubectl CLI installed
- [ ] Civo CLI installed (`brew install civo` on macOS)

### ✅ Repository Setup
- [ ] Cloud Pirates repository cloned
- [ ] All source files present:
  - [ ] frontend/ directory with React app
  - [ ] backend/ directory with Node.js server
  - [ ] k8s/ directory with Kubernetes manifests
  - [ ] .github/workflows/ with CI/CD configuration

### ✅ Frontend Ready
- [ ] App.jsx updated with professional hospital UI
- [ ] EMRForm.jsx improved with better styling
- [ ] Admin.jsx improved with table layout
- [ ] All components in frontend/src/components/
- [ ] Styles are consistent and professional

### ✅ Backend Ready
- [ ] Express server configured (index.js)
- [ ] Database migration script (migrate.js)
- [ ] Health endpoint implemented (/api/health)
- [ ] All API routes defined:
  - [ ] POST /api/emr (create patient)
  - [ ] GET /api/emrs (list patients)
  - [ ] GET /api/emr/:id (get patient)
  - [ ] POST /api/emr/:id/scan (upload scan)
  - [ ] GET /api/emr/:id/scans (list scans)
  - [ ] GET /api/emr/:id/inferences (get AI results)

### ✅ Docker Images
- [ ] Backend Dockerfile present
- [ ] Frontend Dockerfile present
- [ ] Images building successfully locally
- [ ] Images pushed to GitHub Container Registry (ghcr.io)

## Deployment Checklist

### Step 1: Prepare Environment
- [ ] Civo API key exported: `export CIVO_API_KEY="..."`
- [ ] GitHub username exported: `export GITHUB_USERNAME="..."`
- [ ] GitHub token exported: `export GITHUB_TOKEN="..."`
- [ ] All exports verified: `echo $CIVO_API_KEY | wc -c` (should be > 50)

### Step 2: Run Deployment Script
- [ ] Navigate to project root: `cd /path/to/cloud-pirates`
- [ ] Make script executable: `chmod +x deploy-clean.sh`
- [ ] Run deployment: `./deploy-clean.sh`
- [ ] Wait for completion (8-10 minutes)

### Step 3: Verify Deployment
- [ ] LoadBalancer IP obtained and displayed
- [ ] All pods running: `kubectl get pods -n cloud-pirates`
- [ ] Services created: `kubectl get svc -n cloud-pirates`
- [ ] PostgreSQL database ready: `kubectl get statefulset -n cloud-pirates`

### Step 4: Test Application
- [ ] Open application at http://<LoadBalancer_IP>
- [ ] Dashboard page loads
- [ ] Navigation tabs visible (Dashboard, New Patient, Records, Workflows)
- [ ] No console errors in browser DevTools

### Step 5: Test Features
- [ ] Create New Patient
  - [ ] Fill in patient name
  - [ ] Fill in age
  - [ ] Fill in medical notes
  - [ ] Click "Create Patient Record"
  - [ ] Patient created successfully

- [ ] View Patient Records
  - [ ] Patient Records tab shows created patient
  - [ ] Patient appears in table with name, age, date
  - [ ] Click "View Record" button

- [ ] Patient Details
  - [ ] Patient information displayed
  - [ ] Scans section visible
  - [ ] API endpoints responding

- [ ] Workflows
  - [ ] Workflow builder loads
  - [ ] Can see 9 workflow blocks in library:
    - [ ] EMR block
    - [ ] Inventory block
    - [ ] Storage block
    - [ ] Scan Upload block
    - [ ] AI Analysis block
    - [ ] Billing block
    - [ ] Notification block
    - [ ] Analytics block
    - [ ] API Connector block
  - [ ] Can drag blocks onto canvas
  - [ ] Can connect blocks together

### Step 6: Monitor System
- [ ] Run health check: `./health-check.sh`
- [ ] All systems show green ✓
- [ ] No errors in pod logs
- [ ] LoadBalancer IP remains stable

## Post-Deployment Checklist

### ✅ Documentation
- [ ] Shared Hospital Guide (HOSPITAL_GUIDE.md) with team
- [ ] Provided Improvements Summary (IMPROVEMENTS.md)
- [ ] Documented LoadBalancer IP
- [ ] Backed up kubeconfig.yaml

### ✅ Staff Training
- [ ] Show how to navigate dashboard
- [ ] Train on creating patient records
- [ ] Train on accessing patient records
- [ ] Train on using workflow builder
- [ ] Document any custom workflows needed

### ✅ System Optimization
- [ ] Verified resource usage is minimal
- [ ] Confirmed monthly cost is ~$22
- [ ] Set up monitoring alerts (if available)
- [ ] Configured backup strategy

### ✅ Security
- [ ] Database password changed from default
- [ ] Kubeconfig file secured (not in git)
- [ ] API key not committed to repository
- [ ] Access control documented

## Troubleshooting Guide

### Issue: LoadBalancer IP not appearing
**Solution:**
```bash
kubectl get svc -n cloud-pirates
# Wait 30-60 seconds
kubectl describe svc pirates-frontend -n cloud-pirates
```

### Issue: Backend pods not starting
**Solution:**
```bash
kubectl get pods -n cloud-pirates
kubectl describe pod <pod-name> -n cloud-pirates
kubectl logs <pod-name> -n cloud-pirates
```

### Issue: Database connection error
**Solution:**
```bash
# Check PostgreSQL pod
kubectl get pods -n cloud-pirates | grep postgres
# Check logs
kubectl logs -l app=postgres -n cloud-pirates
# Verify database credentials match in backend secret
kubectl get secret backend-config -n cloud-pirates -o yaml
```

### Issue: Frontend blank or 404 errors
**Solution:**
```bash
# Check frontend pod
kubectl describe pod -l app=pirates-frontend -n cloud-pirates
# Check nginx configuration
kubectl logs -l app=pirates-frontend -n cloud-pirates
```

### Issue: API calls timing out
**Solution:**
```bash
# Test backend connectivity from frontend pod
kubectl exec -it deploy/pirates-frontend -n cloud-pirates -- curl http://pirates-backend/api/health
# Check service DNS
kubectl get svc pirates-backend -n cloud-pirates
```

## Scaling Checklist (If Needed Later)

### For More Users
- [ ] Scale backend replicas: `kubectl scale deployment pirates-backend --replicas=3 -n cloud-pirates`
- [ ] Scale frontend replicas: `kubectl scale deployment pirates-frontend --replicas=2 -n cloud-pirates`
- [ ] Monitor resource usage

### For More Data
- [ ] Increase PostgreSQL storage
- [ ] Consider adding Redis cache
- [ ] Archive old records

### For Higher Performance
- [ ] Upgrade cluster size on Civo dashboard
- [ ] Add more nodes
- [ ] Implement CDN for static assets

## Maintenance Checklist (Monthly)

- [ ] Check cluster health: `./health-check.sh`
- [ ] Review pod logs for errors
- [ ] Verify all services running
- [ ] Test patient creation workflow
- [ ] Check system resource usage
- [ ] Backup database
- [ ] Review cost on Civo dashboard
- [ ] Update Docker images if needed

## Rollback Procedure

If something goes wrong:

```bash
# Get cluster list
civo kubernetes list

# Delete problematic cluster
civo kubernetes delete <cluster-id>

# Re-run deployment
./deploy-clean.sh
```

## Quick Reference Commands

```bash
# Check cluster status
kubectl cluster-info

# View all resources
kubectl get all -n cloud-pirates

# View pod logs
kubectl logs deploy/pirates-backend -n cloud-pirates

# Open shell in pod
kubectl exec -it deploy/pirates-backend -n cloud-pirates -- bash

# Port forward for local testing
kubectl port-forward svc/pirates-backend 3000:80 -n cloud-pirates

# Check resource usage
kubectl top pods -n cloud-pirates

# Delete and redeploy
kubectl delete deployment pirates-backend -n cloud-pirates
kubectl apply -f backend-deployment.yaml
```

## Success Indicators

✅ All systems deployed successfully when:
- Application accessible at LoadBalancer IP
- Dashboard loads in <2 seconds
- Patient creation works end-to-end
- Patient records display correctly
- Workflow builder loads all 9 blocks
- No error messages in browser console
- All pods running (kubectl get pods shows all RUNNING)
- All services show external IP (LoadBalancer IP)
- Health check script shows all green ✓

## Support Contacts

For issues with:
- **Civo Cloud**: support@civo.com or https://www.civo.com/support
- **Kubernetes**: https://kubernetes.io/community/
- **Application**: Check logs with `kubectl logs` or health-check.sh

---

**Document Status**: Ready for Hospital Deployment
**Version**: 1.0
**Last Updated**: Today
**Deployment Complexity**: ⭐ Easy (single script)
**Time to Deploy**: ⏱️ 10-15 minutes
**Experience Required**: ⚙️ Intermediate (need CLI familiarity)
