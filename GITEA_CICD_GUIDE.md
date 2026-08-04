# 🦊 RIT Freshers Hub - Gitea CI/CD Pipeline Guide

Automate your deployments from your self-hosted Gitea repository (`https://git.rit-services.in/ShanmugaKrishnanSM/RIT-nexus.git`) directly to your live VPS!

---

## 🛠️ Choose Your Preferred Gitea CI/CD Method:

* **Method 1: Gitea Actions (Recommended if Gitea Actions is enabled)** — Uses `.gitea/workflows/deploy.yml` with identical syntax to GitHub Actions.
* **Method 2: Gitea Webhook + Lightweight VPS Script (Fastest & Zero Setup)** — Gitea sends an HTTP trigger on push to automatically execute `git pull && npm run build` on your VPS.

---

## 🚀 Method 1: Setting Up Gitea Actions

### Step 1: Add Secrets in Gitea
1. Open your repository in Gitea:
   `https://git.rit-services.in/ShanmugaKrishnanSM/RIT-nexus`
2. Click **Settings** (top right) ➔ **Actions** ➔ **Secrets**.
3. Add these 3 secrets:
   * **`VPS_HOST`**: `129.121.126.66`
   * **`VPS_USERNAME`**: `root`
   * **`VPS_SSH_KEY`**: Paste your SSH Private Key (`cat ~/.ssh/id_rsa` from VPS).

### Step 2: Push Workflow File
The Gitea workflow file is located at [.gitea/workflows/deploy.yml](file:///f:/fresher/Freshers-Hub/.gitea/workflows/deploy.yml).

Every `git push origin main` will automatically run the deployment steps on your VPS!

---

## ⚡ Method 2: Setting Up Gitea Webhook (Lightweight & Instant)

If Gitea Actions runner is not active on your Gitea instance, you can use a native **Gitea Webhook**:

### Step 1: Create a Deploy Script on VPS
On your VPS terminal (`ssh root@129.121.126.66`), create a deployment shell script:

```bash
cat << 'EOF' > /var/www/freshers-hub/deploy.sh
#!/bin/bash
echo "🚀 Deploying latest code from Gitea..."
cd /var/www/freshers-hub
git pull origin main
npm run build
cd chatbot-service && go build -o chatbot-service main.go
systemctl restart springboot chatbot telegram-bot nginx
echo "✅ Deployment finished!"
EOF

chmod +x /var/www/freshers-hub/deploy.sh
```

### Step 2: Add Webhook in Gitea
1. Go to your Gitea Repo ➔ **Settings** ➔ **Webhooks**.
2. Click **Add Webhook** ➔ Select **Gitea**.
3. **Target URL:** `http://129.121.126.66:9000/hooks/deploy` (or your webhook port).
4. **HTTP Method:** `POST`
5. **Trigger On:** Push Events.
6. Click **Add Webhook**.

Whenever you push code to Gitea, it triggers `deploy.sh` on your VPS instantly!
