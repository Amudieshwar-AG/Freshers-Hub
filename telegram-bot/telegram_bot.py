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
def send_telegram_message(chat_id: int, text: str, reply_to_message_id: int = None, force_reply: bool = True, token: str = None) -> dict:
    active_token = token or BOT_TOKEN
    url = f"https://api.telegram.org/bot{active_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    if force_reply:
        payload["reply_markup"] = {"force_reply": True, "selective": True}
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
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
        res = requests.get(url, timeout=10).json()
        if res.get("ok"):
            logging.info(f"Successfully connected to Telegram Bot: @{res['result']['username']} ({res['result']['first_name']})")
        else:
            logging.error(f"Failed to connect to Telegram Bot. Check token: {res}")
    except Exception as e:
        logging.error(f"Failed to connect to Telegram API: {e}")

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
                
                logging.info(f"Received message from chat {chat_id}: '{text}'")
                
                # Welcome command
                if text == "/start":
                    if chat_id in helpers:
                        welcome_text = (
                            f"👋 *Welcome back, RIT Senior Helper!*\n\n"
                            f"You are registered as an authorized helper. You will receive new student questions here "
                            f"and can reply directly to them to post answers to the Q&A board."
                        )
                    else:
                        welcome_text = (
                            f"👋 *Welcome to the RIT Student Assistant Bot!*\n\n"
                            f"I can help you answer any questions about Rajalakshmi Institute of Technology (RIT Chennai) — "
                            f"from courses, placements, and hostels, to transport, library hours, and sports.\n\n"
                            f"💬 *Just type your question here!* (e.g., _What courses are offered?_ or _How do I pay fees online?_)\n\n"
                            f"_(For Senior Helpers: To receive student Q&A broadcasts here, register your Chat ID `{chat_id}` in config.json)_"
                        )
                    send_telegram_message(chat_id, welcome_text, force_reply=False, token=bot_token)
                    continue

                # Process reply messages
                reply_to = message.get("reply_to_message")
                if reply_to:
                    # Verify if helper is authorized
                    if chat_id not in helpers:
                        logging.warning(f"Unauthorized message from chat ID {chat_id}")
                        send_telegram_message(chat_id, "⚠️ You are not registered as an authorized helper in config.json.", token=bot_token)
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
                                send_telegram_message(chat_id, "✅ *Answer posted successfully to the Q&A board!*", reply_to_message_id=message["message_id"], token=bot_token)
                            else:
                                send_telegram_message(chat_id, f"❌ *Failed to post answer to backend.* (Status: {res.status_code})\nResponse: {res.text[:100]}", reply_to_message_id=message["message_id"], token=bot_token)
                        except Exception as e:
                            logging.error(f"Error calling backend endpoint {backend_endpoint}: {e}")
                            send_telegram_message(chat_id, f"❌ *Connection error to backend.* ({e})", reply_to_message_id=message["message_id"], token=bot_token)
                    else:
                        send_telegram_message(chat_id, "❓ This message does not correspond to any active question or the mapping has expired.", reply_to_message_id=message["message_id"], token=bot_token)
                else:
                    # Direct chat with the chatbot service
                    if not text:
                        continue
                    
                    logging.info(f"Querying Go chatbot service for user {chat_id}: '{text}'")
                    chatbot_service_url = "http://localhost:8081/api/chat"
                    try:
                        res = requests.post(chatbot_service_url, json={"message": text}, timeout=10)
                        if res.status_code == 200:
                            ans_data = res.json()
                            bot_response = ans_data.get("answer", "I am having trouble processing that question.")
                            send_telegram_message(chat_id, bot_response, force_reply=False, token=bot_token)
                        else:
                            logging.error(f"Go chatbot API returned status code {res.status_code}")
                            send_telegram_message(chat_id, "⚠️ The RIT Chatbot service is currently experiencing issues. Please try again later.", force_reply=False, token=bot_token)
                    except Exception as e:
                        logging.error(f"Failed to connect to Go chatbot service: {e}")
                        send_telegram_message(chat_id, "⚠️ I cannot connect to the RIT Chatbot database right now. Please make sure the service is online.", force_reply=False, token=bot_token)
                        
        except Exception as e:
            logging.error(f"Error in long polling loop: {e}")
            time.sleep(5)

# Telegram polling thread will be started inside main()

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

    is_dm = isinstance(message.channel, discord.DMChannel)
    is_mention = discord_client.user in message.mentions

    if not is_dm and not is_mention:
        return

    content = message.content
    if is_mention:
        # Strip out bot mention tags
        mention_str = f"<@{discord_client.user.id}>"
        mention_nick_str = f"<@!{discord_client.user.id}>"
        content = content.replace(mention_str, "").replace(mention_nick_str, "").strip()

    # Process DM helper replies to active questions
    if is_dm and message.reference and message.reference.message_id:
        current_config = load_config()
        discord_helpers = current_config.get("discord_helper_user_ids", [])
        author_id = message.author.id
        
        # Check if the author is a registered helper
        if author_id in [int(x) for x in discord_helpers if str(x).isdigit()]:
            original_message_id = message.reference.message_id
            question_id = get_question_id(author_id, original_message_id)
            
            if question_id:
                author_name = message.author.name
                logging.info(f"Submitting Discord answer for question {question_id} by helper '{author_name}'")
                
                # Post answer to Spring Boot backend
                backend_url = os.environ.get("SPRING_BACKEND_URL") or current_config.get("spring_backend_url")
                backend_endpoint = f"{backend_url}/api/questions/{question_id}/answers"
                answer_payload = {
                    "body": content,
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
                return

    # Direct query fallback to Go chatbot service
    if not content.strip():
        return

    logging.info(f"Querying Go chatbot service for Discord user {message.author.id}: '{content}'")
    chatbot_service_url = "http://localhost:8081/api/chat"
    try:
        def call_chatbot():
            return requests.post(chatbot_service_url, json={"message": content}, timeout=10)

        # Run requests.post in executor to keep the Discord loop non-blocking
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(None, call_chatbot)
        
        if res.status_code == 200:
            ans_data = res.json()
            bot_response = ans_data.get("answer", "I am having trouble processing that question.")
            await message.reply(bot_response)
        else:
            logging.error(f"Go chatbot API returned status code {res.status_code}")
            await message.reply("⚠️ The RIT Chatbot service is currently experiencing issues. Please try again later.")
    except Exception as e:
        logging.error(f"Failed to connect to Go chatbot service: {e}")
        await message.reply("⚠️ I cannot connect to the RIT Chatbot database right now. Please make sure the service is online.")

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

async def run_discord_bot():
    global discord_loop
    logging.info("Starting Discord bot...")
    discord_loop = asyncio.get_running_loop()
    try:
        await discord_client.start(DISCORD_TOKEN)
    except Exception as e:
        logging.error(f"Discord Bot failed to run: {e}")

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

async def run_uvicorn():
    config = uvicorn.Config(app, host="0.0.0.0", port=8082, loop="asyncio")
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    # Start Telegram long polling thread
    polling_thread = threading.Thread(target=telegram_polling_thread, daemon=True)
    polling_thread.start()

    tasks = []
    if DISCORD_TOKEN:
        tasks.append(run_discord_bot())
    else:
        logging.warning("Discord Bot Token is empty. Skipping Discord bot startup.")
        
    tasks.append(run_uvicorn())
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Shutting down bot server...")
