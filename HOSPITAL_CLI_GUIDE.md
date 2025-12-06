# Hospital Cloud CLI Guide 🏥

**For Non-Technical Hospital Staff**

## What is This?

This is an easy-to-use tool that lets you check on the hospital's cloud system without needing to know technical stuff. Think of it like a dashboard for the hospital's computer system.

---

## Installation

### Option 1: Quick Setup (Recommended)

```bash
# Go to the hospital system folder
cd /Users/yashvanth/Desktop/pirates/cloud-pirates

# Install the CLI globally (one-time)
npm link

# Now you can use from anywhere:
hospital-cli status
```

### Option 2: Manual Usage

```bash
# Go to the hospital system folder
cd /Users/yashvanth/Desktop/pirates/cloud-pirates

# Run commands with:
node hospital-cli.js status
```

---

## Main Commands

### 1. **Check System Status** 
See if everything is working:
```bash
hospital-cli status
```
Shows:
- ✓ All running services
- ✓ Patient database status
- ✓ Application URL (web address)

### 2. **Quick Health Check**
Is the system healthy right now?
```bash
hospital-cli health
```
Shows:
- ✓ Cluster connection
- ✓ Number of services running
- ✓ Database status
- ✓ Web interface accessibility

### 3. **View Patient Count**
How many patients are in the system?
```bash
hospital-cli patients
```
Shows:
- ✓ Total number of patients
- ✓ Recently added patients
- ✓ Patient names and dates

### 4. **Check Database**
Is the patient database working?
```bash
hospital-cli database
```
Shows:
- ✓ Database status
- ✓ Storage information
- ✓ Backup status

### 5. **Get Application URL**
What's the web address?
```bash
hospital-cli url
```
Shows:
- ✓ The link to access the hospital web app
- ✓ Option to open it automatically

### 6. **Recent Logs**
What happened in the system recently?
```bash
hospital-cli logs
```
Shows:
- ✓ Last 10 system messages
- ✓ Any errors or warnings

### 7. **Restart Services** ⚠️
**WARNING: This will temporarily stop the system!**
```bash
hospital-cli restart
```
Use this if:
- ✓ The system is acting slow
- ✓ Something stops working
- ✓ A doctor asks you to restart it
- Takes about 1-2 minutes to come back up

### 8. **View Backups**
Are backups being made?
```bash
hospital-cli backups
```
Shows:
- ✓ Automatic daily backups
- ✓ What happens if data is lost
- ✓ Recovery instructions

### 9. **Help**
How do I use this tool?
```bash
hospital-cli help
```
Shows all available commands and examples.

---

## Interactive Menu

If you just run without any command, you get an interactive menu:

```bash
hospital-cli
```

This gives you:
1. Click/type to select an option
2. Press Enter to run
3. See the results
4. Press Enter to go back to menu

**Perfect for:** Staff who prefer a menu instead of typing commands.

---

## Common Scenarios

### Scenario 1: "The Hospital App Won't Load"

```bash
# Step 1: Check health
hospital-cli health

# Step 2: Get the URL
hospital-cli url

# Step 3: If still not working, restart
hospital-cli restart

# Step 4: Wait 2 minutes, try again
```

### Scenario 2: "I Need to Tell Management About System Status"

```bash
# Get all info:
hospital-cli status

# Send them:
- The ✓ marks show everything is working
- The URL to access it
- Patient count
```

### Scenario 3: "A Doctor Asked About Patient Data"

```bash
# Check how many patients:
hospital-cli patients

# Tell them it's in the system and show:
- Total patients
- Recently added ones
```

### Scenario 4: "System Is Slow"

```bash
# Check health first:
hospital-cli health

# If everything shows ✓, try restarting:
hospital-cli restart

# Wait 1-2 minutes, then test
```

### Scenario 5: "Data Was Lost - Can We Recover?"

```bash
# Check backups:
hospital-cli backups

# Important info will show up - read it carefully
# If data is lost, contact: ops@cloudpirates.io
```

---

## Understanding the Output 🎯

### ✓ (Green Checkmark)
**Good news!** This part is working correctly.

### ⚠️ (Yellow Warning)
**Something might be starting up.** Wait a minute and check again. It's usually OK.

### ✗ (Red X)
**Problem!** Something isn't working. Try restarting or contact support.

### ? (Question Mark)
**Uncertain.** The system couldn't find information. Usually means it's still starting.

---

## Troubleshooting

### Problem: "Command not found"

**Solution:**
```bash
# Make sure you ran installation:
cd /Users/yashvanth/Desktop/pirates/cloud-pirates
npm link
```

### Problem: "Permission Denied"

**Solution:**
```bash
# Add execute permission:
chmod +x hospital-cli.js
```

### Problem: "No kubeconfig found"

**Solution:**
- This means the system hasn't been deployed yet
- Contact: ops@cloudpirates.io
- They will deploy it for you

### Problem: "Can't connect to cluster"

**Solution 1:** Check your internet
```bash
ping google.com
```

**Solution 2:** Try again in a minute (system might be restarting)

**Solution 3:** Contact support if it persists

---

## Support & Help 📞

### For Quick Questions:
- Use: `hospital-cli help`
- Read: This document (HOSPITAL_CLI_GUIDE.md)

### For System Issues:
- Email: ops@cloudpirates.io
- Include:
  - Output of `hospital-cli status`
  - Output of `hospital-cli health`
  - What you were trying to do
  - When the problem started

### For Emergency (System Down):
- Call: Hospital IT Department
- Tell them: "Cloud Pirates system is not responding"
- Give them: Output of `hospital-cli health`

---

## Quick Reference Card 📋

**Print this for your desk:**

```
🏥 HOSPITAL CLOUD CLI - QUICK COMMANDS

1. Everything OK?           → hospital-cli health
2. View patient count       → hospital-cli patients
3. Get web link            → hospital-cli url
4. System status           → hospital-cli status
5. Fix slow system         → hospital-cli restart
6. Get recent messages     → hospital-cli logs
7. Check backups           → hospital-cli backups

✓ = Good    ⚠️ = Warning    ✗ = Problem

Stuck? → hospital-cli help
```

---

## Tips for Success ⭐

1. **Run commands regularly** - Check system health at start of day
2. **Take screenshots** - If something's wrong, screenshot the output
3. **Note the time** - When problems happen, helps support team
4. **Ask for help** - It's OK if you don't understand the output
5. **Don't worry** - The system is designed to be fault-tolerant
6. **Restart is safe** - It won't delete any patient data
7. **Check URL regularly** - Bookmarks it for quick access

---

## FAQ (Frequently Asked Questions) ❓

**Q: Will restarting delete patient data?**
A: No! Patient data is safe. Restarting just restarts the services.

**Q: How often should I check status?**
A: Daily at start of morning shift is good. More if doctors notice issues.

**Q: What if I get an error?**
A: Don't panic! Take a screenshot and email it to ops@cloudpirates.io

**Q: Is the system monitored automatically?**
A: Yes! But this CLI lets you manually check anytime.

**Q: Can I break something?**
A: Unlikely! Only restart when needed. Normal checking can't hurt.

**Q: Do I need to know command line?**
A: No! Use the interactive menu: just type `hospital-cli` and follow prompts.

---

## What Each Service Does 🔧

**Frontend** - The web page doctors use (at the URL)
**Backend** - The computer that handles requests (like a brain)
**Database** - Where all patient data lives (like a filing system)

All three must show ✓ for system to work!

---

**Version:** 1.0  
**Last Updated:** 2024  
**For:** Hospital Staff with no technical background  

**Remember:** When in doubt, take a screenshot and email support! 📸
