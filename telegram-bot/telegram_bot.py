import os
import json
import sqlite3
import threading
import time
import logging
import requests
import asyncio
import discord
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

# Load env variables from .env if present
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

# Load Configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        default_config = {
            "telegram_bot_token": "",
            "helper_chat_ids": [],
            "discord_bot_token": "",
            "discord_helper_user_ids": [],
            "spring_backend_url": "http://localhost:8080"
        }
        with open(CONFIG_PATH, "w") as f:
            json.dump(default_config, f, indent=2)
        return default_config
    
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

config = load_config()
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or config.get("telegram_bot_token")
DISCORD_TOKEN = os.environ.get("DISCORD_BOT_TOKEN") or config.get("discord_bot_token")
BACKEND_URL = os.environ.get("SPRING_BACKEND_URL") or config.get("spring_backend_url", "http://localhost:8080")

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

# Discord Bot Client Setup
intents = discord.Intents.default()
intents.messages = True
intents.message_content = True

discord_client = discord.Client(intents=intents)
discord_loop = None

@discord_client.event
async def on_ready():
    logging.info(f"Discord Bot logged in as {discord_client.user}!")

@discord_client.event
async def on_message(message):
    if message.author == discord_client.user:
        return

    # Process DMs
    if isinstance(message.channel, discord.DMChannel):
        current_config = load_config()
        discord_helpers = current_config.get("discord_helper_user_ids", [])
        author_id = message.author.id
        
        # Verify helper is authorized
        if author_id not in [int(x) for x in discord_helpers if str(x).isdigit()]:
            logging.warning(f"Unauthorized Discord message from user ID {author_id}")
            await message.channel.send("⚠️ You are not registered as an authorized helper in config.json.")
            return

        # Check if helper is replying to a specific question message
        if message.reference and message.reference.message_id:
            original_message_id = message.reference.message_id
            question_id = get_question_id(author_id, original_message_id)
            
            if question_id:
                author_name = message.author.name
                logging.info(f"Submitting Discord answer for question {question_id} by helper '{author_name}'")
                
                # Post answer to Spring Boot backend
                backend_url = current_config.get("spring_backend_url")
                backend_endpoint = f"{backend_url}/api/questions/{question_id}/answers"
                answer_payload = {
                    "body": message.content,
                    "author": author_name
                }
                try:
                    res = requests.post(backend_endpoint, json=answer_payload, timeout=10)
                    if res.status_code in [200, 201]:
                        await message.reply("✅ *Answer posted successfully to the Q&A board!*")
                    else:
                        await message.reply(f"❌ *Failed to post answer to backend.* (Status: {res.status_code})")
                except Exception as e:
                    logging.error(f"Error calling backend endpoint {backend_endpoint}: {e}")
                    await message.reply(f"❌ *Connection error to backend.* ({e})")
            else:
                await message.reply("❓ This message does not correspond to any active question or the mapping has expired.")
        else:
            await message.reply("💬 Please use the **Reply** feature on the question message to answer it so I know which question you're answering!")

async def broadcast_discord_question(question_id: int, title: str, body: str, author: str, user_ids: list):
    formatted_msg = (
        f"❓ **New Student Question!**\n\n"
        f"👤 **Author:** {author}\n"
        f"📌 **Topic:** {title}\n"
        f"📝 **Details:** {body}\n\n"
        f"💬 **Reply directly to this message to submit your answer.**"
    )
    for user_id_val in user_ids:
        try:
            user_id = int(user_id_val)
            user = await discord_client.fetch_user(user_id)
            if user:
                msg = await user.send(formatted_msg)
                save_mapping(user_id, msg.id, question_id)
                logging.info(f"Sent Discord DM to helper {user_id}")
        except Exception as e:
            logging.error(f"Failed to send Discord DM to helper {user_id_val}: {e}")

def run_discord_bot():
    global discord_loop
    logging.info("Starting Discord bot thread...")
    discord_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(discord_loop)
    try:
        discord_loop.run_until_complete(discord_client.start(DISCORD_TOKEN))
    except Exception as e:
        logging.error(f"Discord Bot failed to run: {e}")

# Start Discord Bot Thread
discord_thread = threading.Thread(target=run_discord_bot, daemon=True)
discord_thread.start()

# FastAPI Web Server Setup
app = FastAPI(title="RIT Telegram & Discord Intermediary Bot HTTP Server")

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
    
    # 1. Telegram Broadcast
    telegram_helpers = current_config.get("helper_chat_ids", [])
    telegram_sent = 0
    if telegram_helpers:
        logging.info(f"Broadcasting question {payload.question_id} to {len(telegram_helpers)} Telegram helpers.")
        formatted_msg = (
            f"❓ *New Student Question!*\n\n"
            f"👤 *Author:* {payload.author}\n"
            f"📌 *Topic:* {payload.title}\n"
            f"📝 *Details:* {payload.body}\n\n"
            f"💬 *Reply to this message directly to submit your answer.*"
        )
        for chat_id in telegram_helpers:
            res = send_telegram_message(chat_id, formatted_msg)
            if res.get("ok"):
                message_id = res["result"]["message_id"]
                save_mapping(chat_id, message_id, payload.question_id)
                telegram_sent += 1

    # 2. Discord Broadcast
    discord_helpers = current_config.get("discord_helper_user_ids", [])
    discord_sent = 0
    if discord_helpers and DISCORD_TOKEN:
        logging.info(f"Broadcasting question {payload.question_id} to {len(discord_helpers)} Discord helpers.")
        if discord_loop:
            try:
                asyncio.run_coroutine_threadsafe(
                    broadcast_discord_question(payload.question_id, payload.title, payload.body, payload.author, discord_helpers),
                    discord_loop
                )
                discord_sent = len(discord_helpers)
            except Exception as e:
                logging.error(f"Error scheduling Discord broadcast: {e}")
        else:
            logging.warning("Discord loop not running. Skipping Discord broadcast.")

    return {
        "status": "success",
        "telegram_delivered_to": telegram_sent,
        "discord_queued_for": discord_sent
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
