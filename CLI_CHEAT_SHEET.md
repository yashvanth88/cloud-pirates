# 🏥 Hospital Cloud CLI - Quick Start Card

## 🚀 First Time Setup

```bash
# 1. Open Terminal
# 2. Type this (one time only):
cd /Users/yashvanth/Desktop/pirates/cloud-pirates && npm link

# 3. Now you can use from anywhere:
hospital-cli status
```

---

## 📊 Everyday Commands

| **Need** | **Command** | **What You'll See** |
|---------|----------|-------------------|
| Everything working? | `hospital-cli health` | System status with ✓ or ✗ |
| How many patients? | `hospital-cli patients` | Total patients & recent ones |
| Access the app | `hospital-cli url` | Web link to hospital system |
| Full status | `hospital-cli status` | Complete system overview |
| System messages | `hospital-cli logs` | Recent activity/errors |
| Data backed up? | `hospital-cli backups` | Backup information |
| System slow? | `hospital-cli restart` | Restart (takes 1-2 min) |
| Help! | `hospital-cli help` | Show all commands |

---

## 🎯 Common Situations

### "System isn't working"
```bash
hospital-cli health
# If ✓, system is OK
# If ✗, contact: ops@cloudpirates.io
```

### "Need to tell boss about system"
```bash
hospital-cli status
# Screenshot this and send
```

### "System is slow"
```bash
hospital-cli restart
# Fixes most slow performance
```

### "Doctor asked about patient numbers"
```bash
hospital-cli patients
# Shows total and recent patients
```

### "Data lost - any backup?"
```bash
hospital-cli backups
# Shows if backups exist
# Follow the instructions shown
```

---

## 📱 Easy Mode (Interactive)

Don't know commands? Just do this:

```bash
hospital-cli
```

Then:
1. See numbered menu
2. Type the number (1-9)
3. Press Enter
4. Read the result
5. Press Enter to go back

---

## 🎨 What The Symbols Mean

| Symbol | Meaning | What To Do |
|--------|---------|-----------|
| ✓ (Green) | Working! | All good, no action needed |
| ⚠️ (Yellow) | Starting up | Wait 1 minute, try again |
| ✗ (Red) | Problem | Try restart or contact support |
| ? (Gray) | Unknown | Wait 30 seconds and try again |

---

## 🚨 Emergency (NOTHING WORKS)

```bash
# Step 1: Check status
hospital-cli health

# Step 2: Screenshot the output

# Step 3: Email to: ops@cloudpirates.io
# Include: The screenshot above

# Step 4: Try restarting
hospital-cli restart
```

---

## 📋 Cheat Sheet (Copy & Paste)

```bash
# Check if OK
hospital-cli health

# View patients  
hospital-cli patients

# Get web address
hospital-cli url

# See system status
hospital-cli status

# Check logs
hospital-cli logs

# Restart system
hospital-cli restart

# Need help
hospital-cli help
```

---

## ❓ Stuck? 

**Try this:**

1. Copy the command from "Cheat Sheet"
2. Paste in Terminal
3. Press Enter
4. Screenshot the result
5. Email: ops@cloudpirates.io

**Don't worry** - You can't break anything by just checking status!

---

## 💡 Pro Tips

- ✅ Check status each morning
- ✅ Keep this card near your desk
- ✅ Screenshot errors before contacting support
- ✅ Wait 1 minute after restart before trying again
- ❌ Don't worry about red X marks - just restart
- ❌ Don't turn off the computer (unless told to)

---

## 📞 Support

- **Questions?** Read: `HOSPITAL_CLI_GUIDE.md`
- **Problems?** Email: `ops@cloudpirates.io`
- **Emergency?** Contact: Hospital IT Department

---

**Print this! Keep at your desk! 📌**

**Version:** 1.0 | Made for Hospital Staff | Easy Mode Only ✨
