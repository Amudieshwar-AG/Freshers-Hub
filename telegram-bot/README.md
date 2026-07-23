# 🤖 RIT Freshers Hub - Telegram Q&A Intermediary Bot

This is a lightweight Python microservice that acts as an intermediary between the student Q&A forum and registered helper accounts (Seniors/Staff) on Telegram.

---

## 🚀 How It Works
1. **Student submits a question** on the web portal.
2. **Spring Boot Backend** saves the question and triggers an HTTP POST request to the Python bot: `/send_question`.
3. **Telegram Bot** broadcasts the question with a `force_reply` prompt to all configured helper accounts.
4. **Helpers reply** directly to the Telegram message.
5. **Telegram Bot** captures the reply, maps it back to the original question ID, and pushes the answer back to the Spring Boot REST endpoint (`POST /api/questions/{id}/answers`).

---

## 🛠️ Installation & Setup

### 1. Install Dependencies
Run this in the `telegram-bot/` directory:
```bash
pip install -r requirements.txt
```

### 2. Configure the Bot
Update [config.json](config.json):
```json
{
  "telegram_bot_token": "YOUR_TELEGRAM_BOT_TOKEN",
  "helper_chat_ids": [
    971749136
  ],
  "spring_backend_url": "http://localhost:8080"
}
```

#### How to find your Telegram Chat ID:
1. Search for the bot username on Telegram and click **Start** (or send `/start`).
2. The bot will automatically reply with your exact **Chat ID**.
3. Add this ID to the `helper_chat_ids` array in `config.json`. The bot dynamically reloads configuration changes on the fly!

---

## 🏃 Running the Bot

Start the server:
```bash
python telegram_bot.py
```
* **Bot Server Port**: `8082`
* **Local Mappings Store**: `bot_mappings.db` (SQLite) is created automatically to persist message mappings so that replies continue to map to the correct questions even if the bot is restarted.
