# 🚀 HOSPITAL CLOUD CLI - START HERE

**For Immediate Use - Read This First!**

---

## ⚡ 30-Second Quick Start

### Step 1: One-Time Setup (30 seconds)

Open Terminal and copy-paste this:

```bash
cd /Users/yashvanth/Desktop/pirates/cloud-pirates && npm link
```

Press Enter. Wait for `$` to appear. Done! ✓

### Step 2: Try It (10 seconds)

```bash
hospital-cli health
```

You should see `✓` marks (green checkmarks). Perfect! You're ready.

---

## 📚 What You Need to Know

### The Three Commands You'll Use Most

```bash
hospital-cli health      # Is system working? (most used)
hospital-cli status      # Show system status (for boss)
hospital-cli patients    # How many patients? (for doctor)
```

### What The Symbols Mean

- **✓** (Green) = Working perfectly
- **✗** (Red) = Problem - try restart
- **⚠️** (Yellow) = Starting up - wait 1 min

### One Emergency Command

```bash
hospital-cli restart     # If system is slow (takes 2 min)
```

---

## 🏥 Common Situations - What To Do

### "Is everything OK?"
```bash
hospital-cli health
```
All green? → You're good! Red? → Run restart

### "Doctor needs access"
```bash
hospital-cli url
```
Give them the link shown

### "System seems slow"
```bash
hospital-cli restart
```
Wait 2 minutes, problem usually fixed

### "Need to report to management"
```bash
hospital-cli status
```
Screenshot it and send as report

### "Need to know how many patients"
```bash
hospital-cli patients
```
Tell them the number shown

---

## 📖 Documentation Guide

| Situation | Read This |
|-----------|-----------|
| Don't understand output | `HOSPITAL_CLI_GUIDE.md` |
| Want to learn everything | `STAFF_TRAINING.md` (10 min) |
| Need quick reference | `CLI_CHEAT_SHEET.md` (print it!) |
| All the details | `README_CLI.md` |
| Implementation info | `CLI_IMPLEMENTATION_SUMMARY.md` |

---

## 🆘 If Something Goes Wrong

### Problem: "Command not found"
```bash
cd /Users/yashvanth/Desktop/pirates/cloud-pirates
npm link
hospital-cli health
```

### Problem: "System shows ✗"
```bash
hospital-cli restart
# Wait 2 minutes
hospital-cli health
```

### Problem: "Still not working"
1. Screenshot the error
2. Email to: **ops@cloudpirates.io**
3. Include: Screenshot + what you tried

---

## ✅ Verify It's Working

Run this and you should see all ✓:

```bash
hospital-cli health
```

Expected output:
```
✓ Cluster: Connected
✓ Pods: 3 running
✓ Database: PostgreSQL running
✓ LoadBalancer: Active (212.2.246.88)
✓ Health check complete!
```

---

## 🎯 Your First Commands

**Try these one at a time:**

```bash
# 1. Check if system is OK
hospital-cli health

# 2. Get the website link
hospital-cli url

# 3. See how many patients
hospital-cli patients

# 4. View system overview
hospital-cli status

# 5. Get help anytime
hospital-cli help
```

---

## 📊 Success Indicators

### You're Using It Right If:
- ✅ You run `hospital-cli health` each morning
- ✅ You know the URL to give doctors
- ✅ You can see patient count when asked
- ✅ You can restart system when slow
- ✅ You have cheat sheet at your desk

### It's Working Right If:
- ✅ All commands show results quickly
- ✅ Health check shows mostly ✓ marks
- ✅ System can be restarted without data loss
- ✅ Doctors can access at the URL

---

## 🎓 Next Steps

1. **Now:** Run `hospital-cli help` to see all commands
2. **Today:** Run `hospital-cli health` once (daily habit)
3. **This week:** Read `STAFF_TRAINING.md` (10 minutes)
4. **This week:** Print `CLI_CHEAT_SHEET.md` for your desk
5. **Team:** Show your colleagues how to use it

---

## 📞 Always Remember

**Email for any problems:** ops@cloudpirates.io

**Never need to restart?** That's fine, CLI is mainly for checking.

**Don't understand output?** Read the guide - it's written for non-technical people.

**Someone asking about system?** Run `hospital-cli status` and show them.

---

## ⭐ Pro Tips

✅ **Save time:** Add to your bookmarks: `hospital-cli url`  
✅ **Print it:** Print `CLI_CHEAT_SHEET.md` and tape to desk  
✅ **Shortcut:** Create alias: `alias hc='hospital-cli'`  
✅ **Morning routine:** Run health check when you start work  
✅ **Help others:** Share this file with colleagues  

---

## 🏃 Quick Command List (Copy & Paste)

```bash
# Health & Status
hospital-cli health
hospital-cli status
hospital-cli url

# Information
hospital-cli patients
hospital-cli database
hospital-cli logs

# Emergency
hospital-cli restart

# Help
hospital-cli help
```

---

## ✨ That's It!

You now know enough to:
- Check if system is working
- Restart system if needed
- Get information when asked
- Know where to find help

**You're ready to go!** 🚀

---

## Quick Links

- **Full Guide:** `HOSPITAL_CLI_GUIDE.md`
- **Training:** `STAFF_TRAINING.md`
- **Cheat Sheet:** `CLI_CHEAT_SHEET.md` (print this!)
- **Support:** ops@cloudpirates.io
- **System URL:** Get it with: `hospital-cli url`

---

**Questions? Read `HOSPITAL_CLI_GUIDE.md`**  
**Need training? Read `STAFF_TRAINING.md`**  
**Stuck? Email ops@cloudpirates.io**  

**You've got this!** 💙

---

**Version:** 1.0 | Hospital Cloud CLI | Made Simple for Hospital Staff | 2024
