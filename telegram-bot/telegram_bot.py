import os
import json
import sqlite3
import threading
import time
import logging
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)

# Load Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        default_config = {
            "telegram_bot_token": "8859374355:AAH0dhwstkTBhRerRTjzmb2RG2fjPbigzvo",
            "helper_chat_ids": [],
            "spring_backend_url": "http://localhost:8080"
        }
        with open(CONFIG_PATH, "w") as f:
            json.dump(default_config, f, indent=2)
        return default_config
    
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

config = load_config()
BOT_TOKEN = config.get("telegram_bot_token")
BACKEND_URL = config.get("spring_backend_url")

# Database Setup
DB_PATH = os.path.join(os.path.dirname(__file__), "bot_mappings.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS question_mappings (
            chat_id INTEGER,
            message_id INTEGER,
            question_id INTEGER,
            PRIMARY KEY (chat_id, message_id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

def save_mapping(chat_id: int, message_id: int, question_id: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO question_mappings (chat_id, message_id, question_id) VALUES (?, ?, ?)",
        (chat_id, message_id, question_id)
    )
    conn.commit()
    conn.close()

def get_question_id(chat_id: int, message_id: int) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT question_id FROM question_mappings WHERE chat_id = ? AND message_id = ?",
        (chat_id, message_id)
    )
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

# Telegram API Helpers
def send_telegram_message(chat_id: int, text: str, reply_to_message_id: int = None) -> dict:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "reply_markup": {"force_reply": True, "selective": True}
    }
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
        
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.json()
    except Exception as e:
        logging.error(f"Error sending Telegram message to {chat_id}: {e}")
        return {}

# Background Long Polling for Telegram Updates
def telegram_polling_thread():
    logging.info("Starting Telegram long polling thread...")
    offset = 0
    while True:
        # Re-load config dynamic updates
        current_config = load_config()
        helpers = current_config.get("helper_chat_ids", [])
        backend_url = current_config.get("spring_backend_url")
        bot_token = current_config.get("telegram_bot_token")

        url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
        params = {"offset": offset, "timeout": 20}
        try:
            response = requests.get(url, params=params, timeout=25)
            data = response.json()
            if not data.get("ok"):
                logging.error(f"Telegram API getUpdates error: {data}")
                time.sleep(5)
                continue
                
            updates = data.get("result", [])
            for update in updates:
                offset = update["update_id"] + 1
                
                message = update.get("message")
                if not message:
                    continue
                    
                chat_id = message["chat"]["id"]
                text = message.get("text", "").strip()
                
                # Help helper find their Chat ID
                if text == "/start":
                    welcome_text = (
                        f"👋 *Welcome to RIT Freshers Hub Intermediary Bot!*\n\n"
                        f"To configure this helper, register this Chat ID in the `config.json` file:\n"
                        f"`{chat_id}`\n\n"
                        f"Once registered, you will receive new student questions here and can reply directly to them."
                    )
                    send_telegram_message(chat_id, welcome_text)
                    continue

                # Process reply messages
                reply_to = message.get("reply_to_message")
                if reply_to:
                    # Verify if helper is authorized
                    if chat_id not in helpers:
                        logging.warning(f"Unauthorized message from chat ID {chat_id}")
                        send_telegram_message(chat_id, "⚠️ You are not registered as an authorized helper in config.json.")
                        continue

                    original_message_id = reply_to["message_id"]
                    question_id = get_question_id(chat_id, original_message_id)
                    
                    if question_id:
                        # Extract author name
                        first_name = message["from"].get("first_name", "")
                        last_name = message["from"].get("last_name", "")
                        author_name = f"{first_name} {last_name}".strip() or "Senior Helper"
                        
                        logging.info(f"Submitting answer for question {question_id} by helper '{author_name}'")
                        
                        # Post answer to Spring Boot backend
                        backend_endpoint = f"{backend_url}/api/questions/{question_id}/answers"
                        answer_payload = {
                            "body": text,
                            "author": author_name
                        }
                        try:
                            res = requests.post(backend_endpoint, json=answer_payload, timeout=10)
                            if res.status_code == 200 or res.status_code == 201:
                                send_telegram_message(chat_id, "✅ *Answer posted successfully to the Q&A board!*", reply_to_message_id=message["message_id"])
                            else:
                                send_telegram_message(chat_id, f"❌ *Failed to post answer to backend.* (Status: {res.status_code})\nResponse: {res.text[:100]}", reply_to_message_id=message["message_id"])
                        except Exception as e:
                            logging.error(f"Error calling backend endpoint {backend_endpoint}: {e}")
                            send_telegram_message(chat_id, f"❌ *Connection error to backend.* ({e})", reply_to_message_id=message["message_id"])
                    else:
                        send_telegram_message(chat_id, "❓ This message does not correspond to any active question or the mapping has expired.", reply_to_message_id=message["message_id"])
                        
        except Exception as e:
            logging.error(f"Error in long polling loop: {e}")
            time.sleep(5)

# Start Polling Thread
polling_thread = threading.Thread(target=telegram_polling_thread, daemon=True)
polling_thread.start()

# FastAPI Web Server Setup
app = FastAPI(title="RIT Telegram Intermediary Bot HTTP Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionPayload(BaseModel):
    question_id: int
    title: str
    body: str
    author: str

@app.post("/send_question")
def send_question(payload: QuestionPayload):
    current_config = load_config()
    helpers = current_config.get("helper_chat_ids", [])
    
    if not helpers:
        logging.warning("No helper chat IDs registered in config.json.")
        return {"status": "ignored", "reason": "No helpers registered"}
        
    logging.info(f"Broadcasting question {payload.question_id} to {len(helpers)} helpers.")
    
    formatted_msg = (
        f"❓ *New Student Question!*\n\n"
        f"👤 *Author:* {payload.author}\n"
        f"📌 *Topic:* {payload.title}\n"
        f"📝 *Details:* {payload.body}\n\n"
        f"💬 *Reply to this message directly to submit your answer.*"
    )
    
    sent_count = 0
    for chat_id in helpers:
        res = send_telegram_message(chat_id, formatted_msg)
        if res.get("ok"):
            message_id = res["result"]["message_id"]
            save_mapping(chat_id, message_id, payload.question_id)
            sent_count += 1
            
    return {"status": "success", "delivered_to": sent_count}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
