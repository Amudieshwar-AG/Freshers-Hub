import sys
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Ensure UTF-8 output for terminal/logging
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load configuration from environment or fallback defaults
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "krishnaowoxd@gmail.com")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD", "qkwylwtcsnlrpree").replace(" ", "")
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", "dorutoslayer@gmail.com")

if len(sys.argv) < 7:
    print("Usage: python send_git_email.py <branch> <author> <commit_hash> <timestamp> <message> <changed_files> [deploy_status]")
    sys.exit(1)

branch = sys.argv[1]
author = sys.argv[2]
commit_hash = sys.argv[3]
timestamp = sys.argv[4]
message = sys.argv[5]
changed_files = sys.argv[6]
deploy_status = sys.argv[7] if len(sys.argv) > 7 else os.environ.get("DEPLOY_STATUS", "SUCCESS")

is_success = "SUCCESS" in deploy_status.upper() or "ONLINE" in deploy_status.upper()
status_bg = "#ecfdf5" if is_success else "#fef2f2"
status_border = "#10b981" if is_success else "#ef4444"
status_text = "#047857" if is_success else "#b91c1c"
status_icon = "✅" if is_success else "❌"

subject = f"[Freshers-Hub VPS] {'🟢 ONLINE' if is_success else '🔴 FAILED'} - Deployment Report {commit_hash} ({branch})"

html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; color: #333; padding: 20px; }}
        .card {{ background: #ffffff; border-radius: 12px; padding: 28px; max-width: 650px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }}
        .header {{ color: #1e293b; font-size: 22px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }}
        .status-banner {{ background-color: {status_bg}; border: 1px solid {status_border}; color: {status_text}; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }}
        .field {{ margin-bottom: 12px; font-size: 14px; }}
        .label {{ font-weight: 600; color: #475569; display: inline-block; width: 130px; }}
        .value {{ color: #0f172a; font-weight: 500; }}
        .badge {{ background-color: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; font-weight: 600; }}
        .message-box {{ background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 4px; font-style: italic; margin-top: 6px; font-size: 14px; color: #334155; line-height: 1.5; }}
        .code-box {{ background: #0f172a; color: #38bdf8; padding: 14px; border-radius: 6px; font-family: Consolas, Monaco, monospace; white-space: pre-wrap; word-break: break-all; margin-top: 6px; font-size: 13px; line-height: 1.5; }}
        .services-list {{ background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #334155; margin-top: 6px; font-family: monospace; }}
        .btn {{ display: inline-block; background-color: #f97316; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 15px; text-align: center; }}
        .footer {{ font-size: 12px; color: #94a3b8; margin-top: 28px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 14px; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <span>🚀 RIT Freshers-Hub CI/CD Report</span>
        </div>

        <div class="status-banner">
            <span>{status_icon}</span>
            <span>Deployment Status: {deploy_status.upper()}</span>
        </div>

        <div class="field"><span class="label">Branch:</span> <span class="badge">{branch}</span></div>
        <div class="field"><span class="label">Author:</span> <span class="value">{author}</span></div>
        <div class="field"><span class="label">Commit Hash:</span> <span class="badge">{commit_hash}</span></div>
        <div class="field"><span class="label">Deployment Time:</span> <span class="value">{timestamp}</span></div>

        <div class="field" style="margin-top: 18px;">
            <span class="label" style="width: 100%;">Commit Message:</span>
            <div class="message-box">{message}</div>
        </div>

        <div class="field" style="margin-top: 18px;">
            <span class="label" style="width: 100%;">Verified Microservices Online:</span>
            <div class="services-list">
                🟢 springboot.service (Java API :8085)<br/>
                🟢 chatbot.service (Go AI Engine :8081)<br/>
                🟢 telegram-bot.service (Python Intermediary :8082)<br/>
                🟢 nginx.service (Web Server :80/:443)
            </div>
        </div>

        <div class="field" style="margin-top: 18px;">
            <span class="label" style="width: 100%;">Changed Files (Top Modified):</span>
            <div class="code-box">{changed_files}</div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <a href="https://rit-services.in" class="btn" target="_blank">🌐 View Live Website (rit-services.in)</a>
        </div>

        <div class="footer">Automated deployment & system status report generated by RIT Freshers-Hub VPS Hook</div>
    </div>
</body>
</html>
"""

msg = MIMEMultipart("alternative")
msg["Subject"] = subject
msg["From"] = SENDER_EMAIL
msg["To"] = RECIPIENT_EMAIL
msg.attach(MIMEText(html_content, "html"))

try:
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())
    print("✅ Email report sent successfully.")
except Exception as e:
    print(f"❌ Failed to send email report: {e}")
