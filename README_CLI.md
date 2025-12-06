# 🏥 Cloud Pirates Hospital CLI Tool

**Professional Cloud Management Tool for Hospital Staff (No Technical Skills Required)**

---

## Overview

The Hospital CLI is a **command-line tool** designed specifically for hospital staff to manage the hospital's cloud infrastructure without needing technical knowledge. Think of it as a "dashboard" for checking on the hospital's computer system.

**Key Features:**
- ✅ Simple commands for non-technical staff
- ✅ Interactive menu mode (no typing required)
- ✅ Real-time system health monitoring
- ✅ Patient database management
- ✅ Service status and restart capabilities
- ✅ Color-coded output (easy to understand)
- ✅ Emergency troubleshooting guides

---

## Installation

### Step 1: First Time Setup

```bash
# Navigate to the hospital system folder
cd /Users/yashvanth/Desktop/pirates/cloud-pirates

# Install the CLI tool globally (one-time setup)
npm link

# Verify installation
hospital-cli help
```

**What this does:** Makes `hospital-cli` available from any Terminal window.

### Step 2: Test It

```bash
hospital-cli health
```

You should see:
```
✓ Cluster: Connected
✓ Pods: 3 running
✓ Database: PostgreSQL running
✓ LoadBalancer: Active (212.2.246.88)
```

---

## Usage

### **Method 1: Interactive Menu** (Easiest)

Perfect for hospital staff who prefer clicking/typing choices:

```bash
hospital-cli
```

This shows a numbered menu. Just type the number and press Enter!

### **Method 2: Direct Commands** (Faster)

For staff who know what they want:

```bash
hospital-cli health         # Check system health
hospital-cli status         # See full system status
hospital-cli patients       # View patient count
hospital-cli url           # Get web access link
hospital-cli logs          # See recent activity
hospital-cli restart       # Restart services if slow
```

---

## Commands Reference

### 1. **Status** - Full System Overview
```bash
hospital-cli status
```
**Shows:**
- All running services
- Patient database status
- Web application URL
- Number of running containers

**Use when:** Management asks for system overview, daily check-in

---

### 2. **Health** - Quick System Check
```bash
hospital-cli health
```
**Shows:**
- ✓/✗ Cluster connection
- ✓/✗ Running services
- ✓/✗ Database status
- ✓/✗ LoadBalancer status

**Use when:** Something seems wrong, you need quick diagnosis

---

### 3. **Patients** - Patient Database
```bash
hospital-cli patients
```
**Shows:**
- Total patient count
- Recently added patients
- Patient names and dates added

**Use when:** Doctor asks "How many patients are in the system?"

---

### 4. **Database** - Database Information
```bash
hospital-cli database
```
**Shows:**
- Database name: `hospital_db`
- Database user: `hospital`
- Storage: 5GB
- Backup status: Automatic daily

**Use when:** Data management questions, backup verification

---

### 5. **URL** - Access the Web App
```bash
hospital-cli url
```
**Shows:**
- Web address to access hospital system
- Option to open automatically

**Use when:** Doctor needs access link, first-time setup

---

### 6. **Logs** - Recent Activity
```bash
hospital-cli logs
```
**Shows:**
- Last 10 system messages
- Any errors or warnings
- Server activity

**Use when:** Troubleshooting, documenting issues for support

---

### 7. **Restart** - Fix Slow System ⚠️
```bash
hospital-cli restart
```
**What it does:**
- Restarts all services
- Takes 1-2 minutes
- Does NOT delete patient data
- Fixes most performance issues

**Use when:** System is slow, doctor reports lag

---

### 8. **Backups** - Data Protection
```bash
hospital-cli backups
```
**Shows:**
- Backup schedule
- Recovery instructions
- Data protection status

**Use when:** Data loss concerns, backup verification

---

### 9. **Help** - Get Assistance
```bash
hospital-cli help
```
**Shows:** All available commands and usage examples

---

## Understanding the Output

### Color Coding

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 **Green** ✓ | Everything working | `✓ Cluster: Connected` |
| 🟡 **Yellow** ⚠️ | Starting/Initializing | `⚠️ LoadBalancer: Pending IP` |
| 🔴 **Red** ✗ | Problem/Not working | `✗ Pods: None running` |
| 🔵 **Blue** 📋 | Information | `🌐 Application URL:` |
| 🔷 **Cyan** 🔧 | Technical details | `Checking cluster...` |

### What Each Symbol Means

- **✓** = Working perfectly, no action needed
- **✗** = Problem detected, might need restart
- **⚠️** = Caution, usually temporary, wait 1 min
- **→** = Instruction, follow what it says
- **#** = Command you can copy-paste

---

## Common Scenarios

### Scenario 1: Doctor Can't Access the System

```bash
# Step 1: Check if it's working
hospital-cli health

# Step 2: Get the web address
hospital-cli url

# Step 3: If health shows ✗, restart
hospital-cli restart

# Step 4: Wait 2 minutes, try again
```

**Expected result:** Doctor can access at the URL shown

---

### Scenario 2: Need System Report for Management

```bash
# Run this
hospital-cli status

# Screenshot the output
# Email screenshot to management
# Include: Date, time, and "System is running normally"
```

**Key information:** Look for ✓ marks - they mean OK

---

### Scenario 3: Doctor Asks: "How Many Patients?"

```bash
hospital-cli patients
```

**Tell them:** "We have [NUMBER] patients in the system"

---

### Scenario 4: System Seems Slow

```bash
# Check first
hospital-cli health

# If it shows ✓ for everything, restart
hospital-cli restart

# Wait 1-2 minutes

# Check again
hospital-cli health
```

**Note:** This almost always fixes performance issues

---

### Scenario 5: Data Emergency / Lost Data

```bash
# Check backup status
hospital-cli backups

# Follow the instructions shown
# If unsure, email screenshot to: ops@cloudpirates.io
```

---

## Troubleshooting

### "Command not found: hospital-cli"

**Solution:**
```bash
# Make sure you installed globally
cd /Users/yashvanth/Desktop/pirates/cloud-pirates
npm link

# Try again
hospital-cli health
```

---

### "Permission denied"

**Solution:**
```bash
chmod +x hospital-cli.js
npm link
```

---

### "No kubeconfig found"

**Meaning:** System hasn't been deployed yet

**Solution:** Contact ops@cloudpirates.io

---

### "Can't connect to cluster"

**Step 1:** Check internet
```bash
ping 8.8.8.8
```

**Step 2:** Wait 1 minute (system might be restarting)

**Step 3:** Try again:
```bash
hospital-cli health
```

**Step 4:** If still failing, contact support

---

### "CrashLoopBackOff" error in status

**Meaning:** Backend service is having issues

**Solution:**
```bash
# Restart all services
hospital-cli restart

# Wait 2 minutes

# Check again
hospital-cli status
```

If still showing, contact: ops@cloudpirates.io

---

## For Hospital IT Managers

### Automated Monitoring

Set up a daily check using cron:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 8 AM):
0 8 * * * /usr/local/bin/hospital-cli health >> /var/log/hospital-cli.log 2>&1
```

### Integration with Monitoring

The CLI uses kubectl under the hood, so it integrates with:
- Kubernetes dashboard
- Prometheus monitoring
- Custom dashboards

### Logs Location

- Application logs: `/var/log/hospital-cli.log`
- Kubernetes logs: Available via `hospital-cli logs`
- Backend logs: Available via `kubectl logs`

---

## Architecture

### What It Does

```
Hospital CLI
    ↓
kubectl commands
    ↓
Kubernetes Cluster (MUM1)
    ↓
Services: Frontend | Backend | Database
```

### The Three Services

1. **Frontend** - Hospital web interface
2. **Backend** - API server
3. **Database** - Patient data storage

All three must be running (✓) for system to work.

---

## Security Notes

### What This CLI Can Do
- ✅ Check status
- ✅ View logs
- ✅ Restart services
- ✅ View patient count (aggregate)

### What This CLI Cannot Do
- ❌ Delete patient data
- ❌ Access individual patient records
- ❌ Modify critical settings
- ❌ Change database

**Conclusion:** It's safe for hospital staff to use!

---

## Support & Contact

### Self-Help Resources
1. Read: `HOSPITAL_CLI_GUIDE.md` (detailed guide)
2. Use: `CLI_CHEAT_SHEET.md` (quick reference)
3. Run: `hospital-cli help` (in-tool help)

### Contact Support

**Email:** ops@cloudpirates.io

**Include in your email:**
```
1. Output of: hospital-cli status
2. Output of: hospital-cli health
3. What were you trying to do?
4. When did problem start?
5. Any error messages?
```

### Emergency (System Down)

1. Call: Hospital IT Department
2. Give them: Output of `hospital-cli health`
3. Tell them: "Cloud Pirates system needs immediate attention"

---

## Tips for Success

- ✅ **Check daily** - Run health check each morning
- ✅ **Keep guides** - Print `CLI_CHEAT_SHEET.md` for your desk
- ✅ **Screenshot errors** - Send to support with questions
- ✅ **Note the time** - When problems occur, note the timestamp
- ✅ **Ask questions** - It's OK to not understand technical output
- ✅ **Share knowledge** - Teach other staff to use CLI

---

## FAQ

**Q: Will restarting delete patient data?**
A: No! Data is safe. Only services restart.

**Q: How often should I check?**
A: Daily at start of shift. More if issues occur.

**Q: Can I break anything?**
A: No! Just checking things won't cause damage.

**Q: What if I get an error?**
A: Screenshot it and email to ops@cloudpirates.io

**Q: Is the system monitored automatically?**
A: Yes! This CLI lets you manually verify anytime.

**Q: Do I need IT skills?**
A: No! That's why this tool exists!

---

## Version Info

- **Version:** 1.0.0
- **Release Date:** 2024
- **Region:** Mumbai (MUM1)
- **Cluster:** cloud-pirates-cluster
- **SLA:** 99.9% uptime

---

## Additional Resources

| Document | Purpose |
|----------|---------|
| `HOSPITAL_CLI_GUIDE.md` | Detailed, beginner-friendly guide |
| `CLI_CHEAT_SHEET.md` | Quick reference card (print it!) |
| `HOSPITAL_GUIDE.md` | Hospital operations guide |
| `QUICK_REFERENCE.md` | API and technical reference |

---

## Feedback & Improvement

Help us make this better! If you have suggestions:

1. **What works well?** Tell us!
2. **What's confusing?** Let us know!
3. **What's missing?** We'll add it!

Email: ops@cloudpirates.io with subject: "CLI Feedback"

---

**Made for hospital staff. Designed to be simple. Built to be reliable.** 🏥

*No technical knowledge required. No drama. Just health care.* ✨
