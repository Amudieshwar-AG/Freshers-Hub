# 🔄 RIT Freshers Hub - Step-by-Step CI/CD Pipeline Guide

Automate your live server deployments with **GitHub Actions** so that whenever you run `git push origin main`, your website, backend, chatbot, and services update on your VPS automatically in 30 seconds!

---

## 🏗️ How the CI/CD Pipeline Works

```mermaid
graph LR
    A[💻 Developer Pushes Code] -->|git push origin main| B[🐙 GitHub Repository]
    B -->|Triggers Workflow| C[⚡ GitHub Actions Runner]
    C -->|Secure SSH Connection| D[🌐 VPS Server 129.121.126.66]
    D -->|1. git pull| E[📥 Update Code]
    E -->|2. npm run build| F[⚡ Build PWA Frontend]
    F -->|3. go build| G[🤖 Build Go Engine]
    G -->|4. systemctl restart| H[🚀 Live Site Updated!]
```

---

## 🛠️ Step-by-Step Setup Guide

### Step 1: Add SSH Secrets to your GitHub Repository

1. Open your GitHub Repository in your web browser:
   `https://github.com/Amudieshwar-AG/Freshers-Hub`
2. Click **Settings** (top toolbar) ⚙️.
3. In the left sidebar, expand **Secrets and variables** ➔ click **Actions**.
4. Click **New repository secret** (green button on top right) and add these **3 secrets**:

---

#### 🔑 Secret 1: `VPS_HOST`
* **Name:** `VPS_HOST`
* **Secret Value:** `129.121.126.66`

#### 🔑 Secret 2: `VPS_USERNAME`
* **Name:** `VPS_USERNAME`
* **Secret Value:** `root`

#### 🔑 Secret 3: `VPS_SSH_KEY`
* **Name:** `VPS_SSH_KEY`
* **Secret Value:** Paste your SSH Private Key contents.
  * *Where to find your key on VPS:* Run `cat ~/.ssh/id_rsa` or `cat ~/.ssh/id_ed25519` on your server terminal.
  * Copy the entire key including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.

---

### Step 2: Push the Workflow File to GitHub

The deployment workflow file is already created at:
[.github/workflows/deploy.yml](file:///f:/fresher/Freshers-Hub/.github/workflows/deploy.yml)

Push it to GitHub by running in your local terminal:

```bash
git add .github/workflows/deploy.yml CICD_GUIDE.md
git commit -m "ci: add GitHub Actions automated deployment workflow"
git push origin main
```

---

### Step 3: Test your CI/CD Pipeline! 🎉

1. Make any code edit or change on your project.
2. Push your changes:
   ```bash
   git push origin main
   ```
3. Go to your **GitHub Repository** ➔ Click the **Actions** tab.
4. You will see a live workflow named **"Deploy RIT Freshers Hub to VPS"** running!
5. In ~30 seconds, it will complete with a green checkmark `✓`, and your live server at `https://rit-services.in` will be updated automatically!

---

## 🛑 Troubleshooting CI/CD Pipeline Issues

* **Error: `ssh: handshake failed` or `permission denied (publickey)`**
  * **Fix:** Make sure the public key corresponding to `VPS_SSH_KEY` is added to `/root/.ssh/authorized_keys` on your VPS.
  * On your VPS, run: `cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`
* **Error: `Host key verification failed`**
  * **Fix:** `appleboy/ssh-action` handles host key verification automatically, but ensure `VPS_HOST` is set strictly to `129.121.126.66` without extra spaces or `http://`.
