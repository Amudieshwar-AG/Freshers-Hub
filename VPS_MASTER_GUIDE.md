# 🚀 RIT Freshers Hub - Complete VPS Operations & Maintenance Guide

A complete, beginner-friendly guide to managing, updating, monitoring, and troubleshooting the **RIT Freshers Hub** production server on Linux (Ubuntu / Debian).

---

## 📍 Server & Architecture Summary

* **Server IP:** `129.121.126.66`
* **SSH User:** `root`
* **Primary Domain:** `rit-services.in`
* **Backend API Domain:** `api.rit-services.in`
* **Application Root Path:** `/var/www/freshers-hub`

### 🏗️ Microservice Ports & Services

| Service | Technology | Port | Systemd Service Name | Config Path |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend PWA** | React + Vite + Nginx | `80` / `443` | `nginx` | `/etc/nginx/sites-available/default` |
| **Backend API** | Spring Boot (Java 17) | `8085` | `springboot.service` | `/etc/systemd/system/springboot.service` |
| **Go Chatbot** | Go BM25 Engine | `8081` | `chatbot.service` | `/etc/systemd/system/chatbot.service` |
| **Bots (Telegram/Discord)** | Python FastAPI | `8082` | `telegram-bot.service` | `/var/www/freshers-hub/telegram-bot/.env` |
| **Database** | PostgreSQL | `5432` | `postgresql` | DB User: `postgres`, Password: `RITHosting123` |

---

## 🔑 1. How to Connect to the VPS

Open PowerShell, Command Prompt, or Terminal on your computer and run:

```bash
ssh root@129.121.126.66
```

*(Enter your SSH password when prompted)*

---

## ⚡ 2. Daily Commands (Deploying Updates from GitHub)

Whenever you push new code to GitHub and want to update the live website:

### A) Update Everything in 1 Command Block
Copy and paste this into your VPS terminal:

```bash
cd /var/www/freshers-hub && \
git pull && \
npm run build && \
(cd chatbot-service && go build -o chatbot-service main.go) && \
systemctl restart springboot chatbot telegram-bot nginx
```

---

### B) Updating Specific Parts (Step-by-Step)

#### 1. Update Frontend UI & Static Files Only:
```bash
cd /var/www/freshers-hub
git pull
npm run build
```

#### 2. Restart Spring Boot Backend:
```bash
systemctl restart springboot
```

#### 3. Restart Go Chatbot Microservice:
```bash
cd /var/www/freshers-hub/chatbot-service
git pull
go build -o chatbot-service main.go
systemctl restart chatbot
```

#### 4. Restart Telegram & Discord Bot:
```bash
cd /var/www/freshers-hub/telegram-bot
git pull
systemctl restart telegram-bot
```

---

## 📊 3. Health & Status Check Commands

Want to check if all services are running healthy? Run these commands:

### Check Status of All Services:
```bash
systemctl status springboot chatbot telegram-bot nginx postgresql
```

### Check Active Listening Ports:
```bash
ss -tulpn | grep -E '8085|8081|8082|80|443|5432'
```
*(You should see Java on 8085, Go on 8081, Python on 8082, Nginx on 80/443, PostgreSQL on 5432).*

---

## 📜 4. Viewing Live System Logs (Debugging Errors)

If a feature is failing or you want to see live incoming requests:

### 1. View Spring Boot Backend Logs:
```bash
journalctl -u springboot -n 50 --no-pager
```
*To follow logs live in real-time:* `journalctl -u springboot -f`

### 2. View Go Chatbot Logs:
```bash
journalctl -u chatbot -n 50 --no-pager
```

### 3. View Telegram & Discord Bot Logs:
```bash
journalctl -u telegram-bot -n 50 --no-pager
```

### 4. View Nginx Web Server Access & Error Logs:
```bash
# Recent web traffic requests:
tail -n 30 /var/log/nginx/access.log

# Recent web server errors:
tail -n 30 /var/log/nginx/error.log
```

---

## 🛠️ 5. Common Troubleshooting & Emergency Fixes

### 🚨 Problem 1: "502 Bad Gateway" on Website
* **Cause:** The Spring Boot backend or Go chatbot is stopped.
* **Fix:** Restart all services:
  ```bash
  systemctl restart springboot chatbot nginx
  ```

---

### 🚨 Problem 2: Nginx Configuration Test Fails
* **Check for Nginx syntax errors:**
  ```bash
  sudo nginx -t
  ```
* **If it says syntax is OK, reload Nginx:**
  ```bash
  sudo systemctl reload nginx
  ```

---

### 🚨 Problem 3: Check & Renew SSL Certificates (HTTPS)
* **Check all SSL certificates & expiry dates:**
  ```bash
  sudo certbot certificates
  ```
* **Force renew SSL certificates (if needed):**
  ```bash
  sudo certbot renew --force-renewal
  sudo systemctl reload nginx
  ```

---

### 🚨 Problem 4: PostgreSQL Database Connection Error
* **Check PostgreSQL status:**
  ```bash
  systemctl status postgresql
  ```
* **Test Database Password manually:**
  ```bash
  PGPASSWORD='RITHosting123' psql -U postgres -h localhost -d freshers_hub_db -c '\dt'
  ```

---

### 🚨 Problem 5: Full Server Reboot (Emergency Reset)
If the server becomes completely unresponsive or memory is full:

```bash
sudo reboot
```

*Wait 60 seconds, reconnect via SSH, and check services:*
```bash
systemctl status springboot chatbot telegram-bot nginx postgresql
```

---

## 💾 6. Database Backup & Restore

### Backup PostgreSQL Database to a `.sql` File:
```bash
PGPASSWORD='RITHosting123' pg_dump -U postgres -h localhost freshers_hub_db > /root/backup_freshers_hub_$(date +%F).sql
```

### Restore Database from a `.sql` Backup File:
```bash
PGPASSWORD='RITHosting123' psql -U postgres -h localhost freshers_hub_db < /root/backup_freshers_hub_2026-08-04.sql
```

---

## 🛡️ 7. Systemd Service File Reference Paths

For reference, all auto-start systemd service configuration files are stored at:

1. **Spring Boot Backend:** `/etc/systemd/system/springboot.service`
2. **Go Chatbot Engine:** `/etc/systemd/system/chatbot.service`
3. **Telegram & Discord Bot:** `/etc/systemd/system/telegram-bot.service`
4. **Nginx Web Server Config:** `/etc/nginx/sites-available/default`

---

### 🏆 You're all set!
Save this document for your team to easily maintain, update, and manage the server with zero prior Linux experience.
