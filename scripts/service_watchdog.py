#!/usr/bin/env python3
"""
Service Health Watchdog — Monitors systemd services and sends email alerts
when any service goes DOWN or comes back UP.

Runs via systemd timer every 60 seconds. Only sends email on STATUS CHANGE.
State is tracked in /tmp/service_watchdog_state.json
"""

import subprocess
import json
import os
import sys
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ─── CONFIGURATION ───
SERVICES = [
    {"name": "springboot",    "label": "Spring Boot API",        "port": "8085"},
    {"name": "chatbot",       "label": "Go AI Chatbot Engine",   "port": "8081"},
    {"name": "telegram-bot",  "label": "Telegram Bot Service",   "port": "8082"},
    {"name": "nginx",         "label": "Nginx Web Server",       "port": "80/443"},
    {"name": "webhook",       "label": "Webhook Receiver",       "port": "9000"},
    {"name": "postgresql",    "label": "PostgreSQL Database",    "port": "5432"},
]

STATE_FILE = "/tmp/service_watchdog_state.json"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Email config (reuses same Gmail credentials as deploy emails)
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "krishnaowoxd@gmail.com")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "qkwylwtcsnlrpree").replace(" ", "")

# Load recipients from shared recipients.txt
recipients_file = os.path.join(SCRIPT_DIR, "recipients.txt")
recipients = []
if os.path.exists(recipients_file):
    with open(recipients_file, "r", encoding="utf-8") as f:
        recipients = [line.strip() for line in f if line.strip() and not line.startswith("#")]

if not recipients:
    recipients = [os.environ.get("RECIPIENT_EMAIL", "dorutoslayer@gmail.com")]


def is_service_active(service_name):
    """Check if a systemd service is currently active (running)."""
    try:
        result = subprocess.run(
            ["systemctl", "is-active", service_name],
            capture_output=True, text=True, timeout=5
        )
        return result.stdout.strip() == "active"
    except Exception:
        return False


def load_previous_state():
    """Load the last known state of all services."""
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_current_state(state):
    """Save current state to disk."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def send_alert_email(changes, current_state):
    """Send an HTML email alert for service status changes."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Determine if any service went DOWN
    has_down = any(c["status"] == "DOWN" for c in changes)
    has_up = any(c["status"] == "UP" for c in changes)

    if has_down and has_up:
        subject = f"[RIT VPS] ⚠️ Service Status Change — {now}"
        banner_bg = "#fef3c7"
        banner_border = "#f59e0b"
        banner_text = "#92400e"
        banner_icon = "⚠️"
        banner_msg = "Some services changed status"
    elif has_down:
        subject = f"[RIT VPS] 🔴 SERVICE DOWN ALERT — {now}"
        banner_bg = "#fef2f2"
        banner_border = "#ef4444"
        banner_text = "#b91c1c"
        banner_icon = "🚨"
        banner_msg = "One or more services went DOWN"
    else:
        subject = f"[RIT VPS] 🟢 SERVICE RECOVERED — {now}"
        banner_bg = "#ecfdf5"
        banner_border = "#10b981"
        banner_text = "#047857"
        banner_icon = "✅"
        banner_msg = "Services have recovered and are back online"

    # Build change rows
    change_rows = ""
    for c in changes:
        if c["status"] == "DOWN":
            icon = "🔴"
            status_label = "WENT DOWN"
            row_bg = "#fef2f2"
            row_color = "#b91c1c"
        else:
            icon = "🟢"
            status_label = "RECOVERED"
            row_bg = "#ecfdf5"
            row_color = "#047857"

        change_rows += f"""
        <tr style="background: {row_bg};">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e293b;">{icon} {c['label']}</td>
            <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">{c['name']}.service</td>
            <td style="padding: 10px 14px; font-family: monospace; color: #64748b;">:{c['port']}</td>
            <td style="padding: 10px 14px; font-weight: 700; color: {row_color};">{status_label}</td>
        </tr>"""

    # Build full status rows
    status_rows = ""
    for svc in SERVICES:
        is_up = current_state.get(svc["name"], False)
        s_icon = "🟢" if is_up else "🔴"
        s_label = "Running" if is_up else "Down"
        s_color = "#047857" if is_up else "#b91c1c"
        status_rows += f"""
        <tr>
            <td style="padding: 8px 14px; color: #1e293b;">{s_icon} {svc['label']}</td>
            <td style="padding: 8px 14px; font-family: monospace; color: #64748b;">:{svc['port']}</td>
            <td style="padding: 8px 14px; font-weight: 600; color: {s_color};">{s_label}</td>
        </tr>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f8; padding: 20px;">
        <div style="background: #fff; border-radius: 12px; padding: 28px; max-width: 650px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
            <div style="font-size: 22px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
                🛡️ RIT VPS Service Health Monitor
            </div>

            <div style="background: {banner_bg}; border: 1px solid {banner_border}; color: {banner_text}; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                <span>{banner_icon}</span>
                <span>{banner_msg}</span>
            </div>

            <div style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
                Detected at: <strong style="color: #1e293b;">{now}</strong>
            </div>

            <h3 style="font-size: 15px; color: #1e293b; margin: 20px 0 10px;">Status Changes</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="padding: 10px 14px; text-align: left; color: #475569;">Service</th>
                        <th style="padding: 10px 14px; text-align: left; color: #475569;">Unit</th>
                        <th style="padding: 10px 14px; text-align: left; color: #475569;">Port</th>
                        <th style="padding: 10px 14px; text-align: left; color: #475569;">Event</th>
                    </tr>
                </thead>
                <tbody>{change_rows}</tbody>
            </table>

            <h3 style="font-size: 15px; color: #1e293b; margin: 24px 0 10px;">Full System Status</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="padding: 8px 14px; text-align: left; color: #475569;">Service</th>
                        <th style="padding: 8px 14px; text-align: left; color: #475569;">Port</th>
                        <th style="padding: 8px 14px; text-align: left; color: #475569;">Status</th>
                    </tr>
                </thead>
                <tbody>{status_rows}</tbody>
            </table>

            <div style="text-align: center; margin-top: 20px;">
                <a href="https://rit-services.in" style="display: inline-block; background: #f97316; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px;" target="_blank">🌐 Check Live Site</a>
            </div>

            <div style="font-size: 12px; color: #94a3b8; margin-top: 28px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                Automated health alert from RIT VPS Watchdog • Checks every 60 seconds
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipients, msg.as_string())
        print(f"✅ Alert email sent: {subject}")
    except Exception as e:
        print(f"❌ Failed to send alert: {e}")


def main():
    previous_state = load_previous_state()
    current_state = {}
    changes = []

    for svc in SERVICES:
        is_up = is_service_active(svc["name"])
        current_state[svc["name"]] = is_up

        # Compare with previous state (skip first run — no alert on initial scan)
        if svc["name"] in previous_state:
            was_up = previous_state[svc["name"]]
            if was_up and not is_up:
                changes.append({**svc, "status": "DOWN"})
                print(f"🔴 {svc['label']} ({svc['name']}) went DOWN!")
            elif not was_up and is_up:
                changes.append({**svc, "status": "UP"})
                print(f"🟢 {svc['label']} ({svc['name']}) recovered!")

    # Save current state for next run
    save_current_state(current_state)

    # Send email only if there are status changes
    if changes:
        send_alert_email(changes, current_state)
    else:
        print(f"✓ All services stable — no changes detected ({datetime.now().strftime('%H:%M:%S')})")


if __name__ == "__main__":
    main()
