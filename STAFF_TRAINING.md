# 🏥 Hospital Cloud CLI - Staff Training Manual

**Learn to Use the Cloud Management Tool in 10 Minutes**

---

## Who Needs This?

- 👨‍⚕️ Doctors
- 👩‍⚕️ Nurses
- 📋 Hospital Administrators
- 🖥️ IT Staff
- 🔧 Hospital Technicians

**Do NOT need:** Technical knowledge, coding skills, or previous experience

---

## Part 1: What You Need to Know (5 minutes)

### The Big Picture

Your hospital has a **cloud system** that stores:
- ✅ Patient records
- ✅ Medical scans
- ✅ Doctor notes
- ✅ Hospital workflows

### Three Things Are Running

```
┌─────────────────────────────────────┐
│         HOSPITAL SYSTEM             │
├─────────────────────────────────────┤
│ 1. WEBSITE    (What doctors use)   │
│ 2. SERVER     (Does the work)      │
│ 3. DATABASE   (Stores patient data)│
└─────────────────────────────────────┘
```

All three must be running for system to work.

### The CLI Tool's Job

The CLI tool lets you:
- 🔍 Check if everything is working
- 🚨 See if there's a problem
- 🔧 Fix problems (restart)
- 📊 Get information for the boss

It's like a **dashboard** for the hospital computer!

---

## Part 2: Installation (3 minutes)

### First Time: One-Time Setup

**Open Terminal** (on Mac, search for "Terminal"):

```bash
# Copy-paste this ONE TIME:
cd /Users/yashvanth/Desktop/pirates/cloud-pirates && npm link
```

Press Enter.

**Wait:** You'll see some text. This is normal. When you see `$` again, it's done.

### Verify It Works

```bash
hospital-cli help
```

**Result:** You should see a list of commands. ✓ You're good to go!

---

## Part 3: Most Important Commands (2 minutes)

### 1. Is Everything OK?
```bash
hospital-cli health
```

**Look for:** `✓` (green check marks)

- All green ✓? = **GOOD**, no action needed
- Any red ✗? = **PROBLEM**, try restart
- Yellow ⚠️? = **STARTING**, wait 1 minute

### 2. How Many Patients?
```bash
hospital-cli patients
```

**Result:** Shows total patients and recent ones

### 3. Get the Web Address
```bash
hospital-cli url
```

**Result:** The link doctors use to access the system

### 4. System Is Slow - Fix It
```bash
hospital-cli restart
```

**Warning:** Takes 1-2 minutes to come back up (data is safe!)

### 5. Show System Status
```bash
hospital-cli status
```

**Result:** Full overview - great for showing the boss

---

## Part 4: Decision Tree (Use This!)

### "I don't know what to do"

```
START HERE
    ↓
Is the system responding?
    ↓
YES → Run: hospital-cli health
      Is all green? → YES → You're done! ✓
      Is something red? → NO → hospital-cli restart
    ↓
NO (Site won't load)
    ↓
Try: hospital-cli health
If still broken:
    1. Take screenshot
    2. Email to: ops@cloudpirates.io
```

---

## Part 5: Real-World Scenarios

### "Doctor can't login"

**Step 1:** Check system
```bash
hospital-cli health
```

**Step 2:** If all green ✓:
- Tell doctor: "System is working, try clearing browser cache"
- Have doctor try different browser

**Step 3:** If anything red ✗:
- Tell doctor: "We're fixing it, give us 2 minutes"
- Run: `hospital-cli restart`
- Wait 2 minutes
- Tell doctor: "Try again now"

---

### "Need to tell management how system is doing"

**Step 1:** Get status
```bash
hospital-cli status
```

**Step 2:** Screenshot it

**Step 3:** Email screenshot to management with note:

```
Subject: Hospital System Status Report

The hospital cloud system is [WORKING / NEEDS ATTENTION]

Key metrics:
- All services: ✓ Running
- Patient database: ✓ Active
- Web access: ✓ Available at http://212.2.246.88
- Backups: ✓ Automatic daily

[Attachment: screenshot of hospital-cli status]
```

---

### "Someone asks: How many patients do we have?"

**Do this:**
```bash
hospital-cli patients
```

**Tell them:** "We have [NUMBER] patients in the system"

---

### "System is acting really slow"

**Do this:**
```bash
# Check what's happening
hospital-cli health

# If it shows everything OK but slow, restart
hospital-cli restart

# Wait 1-2 minutes for restart

# Check again
hospital-cli health

# If better, tell users: "System fixed"
```

---

### "Someone says data might be lost"

**Do this:**
```bash
hospital-cli backups
```

**Read the output** and:
- If backup is recent: "Data is backed up, we can recover"
- If no backup: "Contact ops@cloudpirates.io IMMEDIATELY"

---

## Part 6: What The Output Means

### Green ✓ (Good)
```
✓ Cluster: Connected
✓ Pods: 3 running
✓ Database: PostgreSQL running
✓ LoadBalancer: Active (212.2.246.88)
```
**What to do:** Nothing! System is great.

---

### Red ✗ (Problem)
```
✗ Pods: None running
✗ Cluster: Not connected
```
**What to do:** 
1. Try: `hospital-cli restart`
2. Wait 2 minutes
3. Check again
4. If still red, email screenshot to ops@cloudpirates.io

---

### Yellow ⚠️ (Caution)
```
⚠️ LoadBalancer: Pending IP allocation
```
**What to do:** Wait 1-2 minutes, then check again

---

## Part 7: Emergency Guide

### System is Down!

**Step 1: Stay calm** - Data is safe, backed up automatically

**Step 2: Check status**
```bash
hospital-cli health
```

**Step 3: Try restart**
```bash
hospital-cli restart
```

**Step 4: Wait 2 minutes**

**Step 5: Check again**
```bash
hospital-cli health
```

**Step 6: If still down:**
1. Take screenshot of: `hospital-cli health`
2. Take screenshot of: `hospital-cli status`
3. Email both to: ops@cloudpirates.io
4. Call hospital IT department
5. Tell them: "Cloud Pirates system is not responding"

---

## Part 8: "I'm Not Sure What To Do" Guide

### When confused, remember:

1. **Looking for help?**
   ```bash
   hospital-cli help
   ```

2. **Need quick reference?**
   - Print: `CLI_CHEAT_SHEET.md`
   - Keep at your desk

3. **Want detailed guide?**
   - Read: `HOSPITAL_CLI_GUIDE.md`

4. **System acting weird?**
   ```bash
   hospital-cli health
   ```

5. **Still confused?**
   - Email: ops@cloudpirates.io
   - Include screenshot
   - Include what you were trying to do
   - Include when it happened

---

## Part 9: Things You CAN'T Mess Up

✅ **Safe to do:**
- Run `hospital-cli` commands
- Check status
- View logs
- Restart services
- Run help

❌ **Can't do (and don't worry about):**
- Delete patient data
- Access other hospitals' data
- Modify critical systems
- Break the database

**Bottom line:** You can't accidentally damage anything by using the CLI!

---

## Part 10: Quick Checklist

### Daily Morning Routine

- [ ] Open Terminal
- [ ] Run: `hospital-cli health`
- [ ] If all green ✓, tell staff: "System ready"
- [ ] If anything else, restart and wait 2 minutes
- [ ] Run health check again
- [ ] All good? You're done!

### If Doctor Reports Problem

- [ ] Run: `hospital-cli health`
- [ ] Run: `hospital-cli status`
- [ ] Take screenshot
- [ ] If problem persists, restart: `hospital-cli restart`
- [ ] If still broken, email screenshot to: ops@cloudpirates.io

### If Management Asks for Report

- [ ] Run: `hospital-cli status`
- [ ] Screenshot it
- [ ] Send screenshot with message: "System status attached"

---

## Part 11: Keyboard Tips

### Copy-Paste (Easy Commands)

```bash
# Just copy and paste, then press Enter:

# Check health
hospital-cli health

# Get patient count
hospital-cli patients

# Get web link
hospital-cli url

# Restart (when slow)
hospital-cli restart

# See logs
hospital-cli logs
```

### If You Get Stuck

- **Press Ctrl+C** to stop
- **Press Ctrl+Z** if stuck
- **Close and reopen** Terminal if needed
- **Try again** - no permanent damage

---

## Part 12: Support Contacts

### For Different Issues

| Issue | What to Do |
|-------|-----------|
| Forgot a command | `hospital-cli help` |
| System won't work | `hospital-cli restart` |
| Doctor can't access | `hospital-cli url` then tell them the link |
| Need full report | `hospital-cli status` then screenshot |
| Still stuck | Email ops@cloudpirates.io with screenshot |
| Emergency | Call hospital IT immediately |

### Email Template

```
To: ops@cloudpirates.io

Subject: Hospital Cloud System Issue

Body:
"I'm experiencing an issue with the hospital cloud system.

Please find attached:
- Screenshot of hospital-cli status
- Screenshot of hospital-cli health

Problem: [Describe what's happening]
When: [What time did it start]
Who: [Your name]"
```

---

## Part 13: Troubleshooting

### "Command not found"

**Error:** `zsh: command not found: hospital-cli`

**Fix:**
```bash
# Go back to setup
cd /Users/yashvanth/Desktop/pirates/cloud-pirates
npm link

# Try again
hospital-cli health
```

---

### "Permission denied"

**Error:** `Permission denied`

**Fix:**
```bash
# Allow execution
chmod +x hospital-cli.js

# Try npm link again
npm link
```

---

### "No kubeconfig"

**Error:** `Kubeconfig not found`

**Fix:** System not deployed yet
- Contact: ops@cloudpirates.io
- They will deploy for you

---

### "Can't connect to internet"

**Error:** Network errors

**Fix:**
1. Check WiFi/network
2. Wait 1 minute
3. Try again: `hospital-cli health`
4. If persistent, contact IT

---

## Part 14: Sharing With Your Team

### Print These Pages

1. **`CLI_CHEAT_SHEET.md`** - Quick reference for desk
2. **This guide** - Training for staff

### Train Your Colleagues

1. Show them this guide
2. Have them run: `hospital-cli health`
3. Explain the output
4. Practice together once
5. They're ready!

---

## Part 15: Remember These Points

### Most Important Things

✅ **System check:** `hospital-cli health`  
✅ **If slow:** `hospital-cli restart`  
✅ **Stuck?:** `hospital-cli help`  
✅ **Emergency?:** Screenshot + email ops@cloudpirates.io  

### Key Facts

- ✅ Data is automatically backed up
- ✅ Restarting doesn't delete anything
- ✅ You can't break anything
- ✅ Support is friendly and helpful
- ✅ All tools are designed for non-technical staff

---

## Final Checklist: Are You Ready?

Answer these:

- [ ] I can open Terminal
- [ ] I can run: `hospital-cli help`
- [ ] I understand what ✓, ✗, and ⚠️ mean
- [ ] I know when to run restart
- [ ] I know where to email for help
- [ ] I have printed the cheat sheet

**If you checked all boxes: You're ready to manage the hospital cloud system!** 🎉

---

## Quick Links

- **Detailed Guide:** `HOSPITAL_CLI_GUIDE.md`
- **Quick Reference:** `CLI_CHEAT_SHEET.md`
- **Full Documentation:** `README_CLI.md`
- **Support Email:** ops@cloudpirates.io
- **System URL:** `hospital-cli url`

---

**Congratulations! You're now trained on the Hospital Cloud CLI.** 

*No technical background needed. Just hospital staff helping hospital staff.*

**Questions?** Email: ops@cloudpirates.io  
**In a hurry?** Run: `hospital-cli help`  
**Need support?** We're here to help! 📞

---

## For IT Managers

This training is designed for:
- Average reading time: 10 minutes
- No prerequisites required
- Hands-on learning
- Real-world scenarios
- Easy reference materials

**Roll out plan:**
1. Print cheat sheets
2. Have staff read this guide
3. Do one practice run together
4. They're ready!

**Feedback:** If staff have difficulty, email: ops@cloudpirates.io

---

*Version 1.0 | Made for Hospital Staff | 2024*

**Because healthcare shouldn't require a degree in computer science.** 💙
