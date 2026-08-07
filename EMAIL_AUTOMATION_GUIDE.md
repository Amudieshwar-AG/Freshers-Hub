# 📧 Git Push & Deployment Email Notification Automation Guide

This guide explains how the automated email reporting system for **Freshers-Hub** works, including configuration, scripts, and integration steps for VPS & Gitea CI/CD pipelines.

---

## 🛠️ Overview of Included Scripts

Two core scripts were added to the repository under the [`scripts/`](file:///f:/fresher/Freshers-Hub/scripts) directory:

1. **[`scripts/send_git_email.py`](file:///f:/fresher/Freshers-Hub/scripts/send_git_email.py)**: Python script using `smtplib` to send rich HTML formatted deployment reports to `dorutoslayer@gmail.com` via Gmail SMTP.
2. **[`scripts/post-receive.sh`](file:///f:/fresher/Freshers-Hub/scripts/post-receive.sh)**: Shell script template for Git post-receive hook execution.

---

## ⚙️ Configuration Details

| Parameter | Value |
| :--- | :--- |
| **Sender Email** | `krishnaowoxd@gmail.com` |
| **App Password** | `qkwylwtcsnlrpree` (no spaces) |
| **Recipient Email** | `dorutoslayer@gmail.com` |
| **SMTP Host / Port** | `smtp.gmail.com:587` (TLS) |

---

## 🚀 How to Enable Automated Email Reports

### Method A: Add to VPS Webhook / Deployment Script (Recommended)

If your VPS uses the Webhook endpoint (`http://129.121.126.66:9000/hooks/deploy`), update `/var/www/freshers-hub/deploy.sh` on your VPS to execute asynchronously in the background. This ensures the Webhook returns an instant `200 OK` response to Gitea in 0.1 seconds, preventing timeout errors!

```bash
#!/bin/bash
# /var/www/freshers-hub/deploy.sh

(
    cd /var/www/freshers-hub
    
    # 1. Pull latest code
    git pull origin main
    
    # 2. Rebuild & Restart services
    npm run build
    systemctl restart springboot chatbot telegram-bot nginx
    
    # 3. 📧 Send Email Report Notification
    python3 /var/www/freshers-hub/scripts/send_git_email.py \
        "$(git rev-parse --abbrev-ref HEAD)" \
        "$(git log -1 --format='%an <%ae>')" \
        "$(git log -1 --format='%h')" \
        "$(git log -1 --format='%cd' --date=local)" \
        "$(git log -1 --format='%B')" \
        "$(git diff-tree --no-commit-id --name-status -r HEAD | head -n 15)"

) >> /var/log/deploy.log 2>&1 &

echo '{"status": "ok", "message": "Deployment triggered in background"}'
```

---

### Method B: Configure Gitea Git Hook

If using Gitea custom hooks:

1. Go to your Gitea repository page: `https://git.rit-services.in/ShanmugaKrishnanSM/RIT-nexus`.
2. Navigate to **Settings** -> **Git Hooks**.
3. Edit **`post-receive`** (or `custom_hooks/post-receive`).
4. Paste the following hook script:

```bash
#!/bin/bash
/usr/bin/python3 /var/www/freshers-hub/scripts/send_git_email.py \
    "main" \
    "$(git log -1 --format='%an <%ae>')" \
    "$(git log -1 --format='%h')" \
    "$(git log -1 --format='%cd' --date=local)" \
    "$(git log -1 --format='%B')" \
    "$(git diff-tree --no-commit-id --name-status -r HEAD | head -n 15)"
```
5. Save changes.

---

## 🧪 Manual Verification Command

To verify that email delivery works from your VPS terminal:

```bash
python3 /var/www/freshers-hub/scripts/send_git_email.py \
    "main" \
    "Test Author <krishnaowoxd@gmail.com>" \
    "cd30366" \
    "Fri Aug 7 11:55:00 2026" \
    "Testing email notification system" \
    "M src/components/BusRouteMap/BusRouteMap.tsx"
```

---

## 📊 Sample HTML Email Report Format

When triggered, the recipient receives a formatted HTML email containing:
- **Branch**: `main`
- **Author**: Commit Author Name & Email
- **Commit Hash**: Short 7-character hash
- **Timestamp**: Date & Time of push
- **Commit Message**: Full commit message text
- **Changed Files**: List of top modified files (`M`, `A`, `D`)
