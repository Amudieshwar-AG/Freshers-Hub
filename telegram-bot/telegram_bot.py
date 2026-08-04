import os
import json
import sqlite3
import threading
import time
import logging
import requests
import asyncio
import discord
from typing import Optional
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
            "community_bot_token": "8859374355:AAH0dhwstkTBhRerRTjzmb2RG2fjPbigzvo",
            "telegram_bot_token": "8913773505:AAHASuKLLOto3Ax573_dxg8bnvQy2ML6yLk",
            "helper_chat_ids": [],
            "spring_backend_url": "http://localhost:8085"
        }
        with open(CONFIG_PATH, "w") as f:
            json.dump(default_config, f, indent=2)
        return default_config
    
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

config = load_config()
COMMUNITY_BOT_TOKEN = os.environ.get("COMMUNITY_BOT_TOKEN") or config.get("community_bot_token", "8859374355:AAH0dhwstkTBhRerRTjzmb2RG2fjPbigzvo")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or config.get("telegram_bot_token")
DISCORD_TOKEN = os.environ.get("DISCORD_BOT_TOKEN") or config.get("discord_bot_token")
BACKEND_URL = os.environ.get("SPRING_BACKEND_URL") or config.get("spring_backend_url", "http://localhost:8085")

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
def send_telegram_message(chat_id: int, text: str, reply_to_message_id: int = None, force_reply: bool = False, reply_markup: dict = None, token: str = None) -> dict:
    active_token = token or BOT_TOKEN
    url = f"https://api.telegram.org/bot{active_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    elif force_reply:
        payload["reply_markup"] = {"force_reply": True, "selective": True}
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
        
    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.json()
    except Exception as e:
        logging.error(f"Error sending Telegram message to {chat_id}: {e}")
        return {}

def answer_telegram_callback(callback_query_id: str, text: str = None, token: str = None):
    active_token = token or BOT_TOKEN
    url = f"https://api.telegram.org/bot{active_token}/answerCallbackQuery"
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logging.error(f"Error answering callback query: {e}")

def edit_telegram_message(chat_id: int, message_id: int, text: str, reply_markup: dict = None, token: str = None):
    active_token = token or BOT_TOKEN
    url = f"https://api.telegram.org/bot{active_token}/editMessageText"
    payload = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logging.error(f"Error editing message: {e}")

TAG_MAP = {
    "1": "looking for co-developing a project from scratch",
    "2": "looking for beta testers",
    "3": "looking for Open-source Collaborators/Contributers"
}

USER_COLLAB_STATE = {}

def parse_collab_text(text: str):
    data = {
        "authorName": None,
        "department": None,
        "year": None,
        "tag": None,
        "projectIdea": None,
        "githubLink": None,
        "collaboratorsNeeded": None
    }
    
    lines = text.splitlines()
    if lines and lines[0].lower().startswith("/collab"):
        command_line = lines[0]
        rest = command_line[7:].strip()
        if "|" in rest:
            parts = [p.strip() for p in rest.split("|")]
            if len(parts) >= 1: data["authorName"] = parts[0]
            if len(parts) >= 2: data["department"] = parts[1]
            if len(parts) >= 3: data["year"] = parts[2]
            if len(parts) >= 4: 
                t = parts[3].strip()
                data["tag"] = TAG_MAP.get(t, t)
            if len(parts) >= 5: data["projectIdea"] = parts[4]
            if len(parts) >= 6: data["githubLink"] = parts[5]
            if len(parts) >= 7 and parts[6].isdigit(): data["collaboratorsNeeded"] = int(parts[6])
            return data
        lines = lines[1:]

    for line in lines:
        line_str = line.strip()
        if ":" in line_str:
            key, val = line_str.split(":", 1)
            k = key.strip().lower()
            v = val.strip()
            if k == "name":
                data["authorName"] = v
            elif k in ["dept", "department"]:
                data["department"] = v
            elif k == "year":
                data["year"] = v
            elif k in ["tag", "tags"]:
                data["tag"] = TAG_MAP.get(v, v)
            elif k in ["idea", "project", "project idea"]:
                data["projectIdea"] = v
            elif k in ["github", "github link", "link"]:
                data["githubLink"] = v
            elif k in ["collaborators", "collaborators needed", "needed"]:
                if v.isdigit():
                    data["collaboratorsNeeded"] = int(v)
        else:
            if not data["projectIdea"]:
                data["projectIdea"] = line_str

    return data

# ─── 1. COMMUNITY SENIOR HELPER BOT LONG POLLING THREAD ──────────────────────
def community_bot_polling_thread():
    logging.info("Starting Community Senior Helper Bot polling thread...")
    offset = 0
    while True:
        current_config = load_config()
        helpers = current_config.get("helper_chat_ids", [])
        backend_url = os.environ.get("SPRING_BACKEND_URL") or current_config.get("spring_backend_url")
        comm_token = os.environ.get("COMMUNITY_BOT_TOKEN") or current_config.get("community_bot_token", COMMUNITY_BOT_TOKEN)

        if not comm_token:
            time.sleep(5)
            continue

        url = f"https://api.telegram.org/bot{comm_token}/getUpdates"
        params = {"offset": offset, "timeout": 20}
        try:
            response = requests.get(url, params=params, timeout=25)
            data = response.json()
            if not data.get("ok"):
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

                if text == "/start":
                    welcome_text = (
                        f"👋 *Welcome back, RIT Senior Helper!*\n\n"
                        f"You are registered as an authorized helper. You will receive new student questions here "
                        f"and can reply directly to them to post answers to the Q&A board."
                    )
                    send_telegram_message(chat_id, welcome_text, force_reply=False, token=comm_token)
                    continue

                reply_to = message.get("reply_to_message")
                if reply_to:
                    if chat_id not in helpers:
                        logging.warning(f"Unauthorized Q&A reply attempt from chat ID {chat_id}")
                        send_telegram_message(chat_id, "⚠️ You are not registered as an authorized helper in config.json.", token=comm_token)
                        continue

                    original_message_id = reply_to["message_id"]
                    question_id = get_question_id(chat_id, original_message_id)
                    
                    if question_id:
                        first_name = message["from"].get("first_name", "")
                        last_name = message["from"].get("last_name", "")
                        author_name = f"{first_name} {last_name}".strip() or "Senior Helper"
                        
                        logging.info(f"Submitting answer for question {question_id} by helper '{author_name}'")
                        
                        backend_endpoint = f"{backend_url}/api/questions/{question_id}/answers"
                        answer_payload = {
                            "body": text,
                            "author": author_name
                        }
                        try:
                            res = requests.post(backend_endpoint, json=answer_payload, timeout=10)
                            if res.status_code in [200, 201]:
                                send_telegram_message(chat_id, "✅ *Answer posted successfully to the Q&A board!*", reply_to_message_id=message["message_id"], token=comm_token)
                            else:
                                send_telegram_message(chat_id, f"❌ *Failed to post answer to backend.* (Status: {res.status_code})\nResponse: {res.text[:100]}", reply_to_message_id=message["message_id"], token=comm_token)
                        except Exception as e:
                            logging.error(f"Error calling backend endpoint {backend_endpoint}: {e}")
                            send_telegram_message(chat_id, f"❌ *Connection error to backend.* ({e})", reply_to_message_id=message["message_id"], token=comm_token)
                    else:
                        send_telegram_message(chat_id, "❓ This message does not correspond to any active question or the mapping has expired.", reply_to_message_id=message["message_id"], token=comm_token)

        except Exception as e:
            logging.error(f"Error in community bot polling loop: {e}")
            time.sleep(5)

# ─── 2. 24/7 CHATBOT & DEV COLLAB BOT LONG POLLING THREAD ────────────────────
def telegram_polling_thread():
    logging.info("Starting RIT Chatbot 24/7 & Dev Collab Bot polling thread...")
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
        res = requests.get(url, timeout=10).json()
        if res.get("ok"):
            logging.info(f"Successfully connected to RIT Chatbot 24/7 Bot: @{res['result']['username']} ({res['result']['first_name']})")
        else:
            logging.error(f"Failed to connect to Telegram Bot. Check token: {res}")
    except Exception as e:
        logging.error(f"Failed to connect to Telegram API: {e}")

    offset = 0
    while True:
        current_config = load_config()
        backend_url = os.environ.get("SPRING_BACKEND_URL") or current_config.get("spring_backend_url")
        bot_token = os.environ.get("TELEGRAM_BOT_TOKEN") or current_config.get("telegram_bot_token")

        url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
        params = {"offset": offset, "timeout": 20}
        try:
            response = requests.get(url, params=params, timeout=25)
            data = response.json()
            if not data.get("ok"):
                error_code = data.get("error_code")
                if error_code == 409:
                    logging.warning("Telegram API 409 Conflict: Another bot instance is active. Sleeping 10s before retrying...")
                    time.sleep(10)
                else:
                    logging.error(f"Telegram API getUpdates error: {data}")
                    time.sleep(5)
                continue
                
            updates = data.get("result", [])
            for update in updates:
                offset = update["update_id"] + 1

                # 1. Callback Queries (Inline buttons)
                callback_query = update.get("callback_query")
                if callback_query:
                    cb_id = callback_query["id"]
                    cb_data = callback_query.get("data", "")
                    cb_message = callback_query.get("message", {})
                    cb_chat_id = cb_message.get("chat", {}).get("id")
                    cb_msg_id = cb_message.get("message_id")
                    
                    if cb_data.startswith("collab_accept_"):
                        parts = cb_data.split("_")
                        app_id = parts[2]
                        contact = "_".join(parts[3:]) if len(parts) > 3 else "the applicant"
                        try:
                            requests.put(f"{backend_url}/api/collab/applications/{app_id}/status?status=ACCEPTED", timeout=5)
                        except Exception as e:
                            logging.error(f"Error updating app status: {e}")
                            
                        answer_telegram_callback(cb_id, "✅ Collaboration Request Accepted!", token=bot_token)
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"✅ *Collaboration Request Accepted!*\n\nYou accepted the collaboration request. Direct contact info: *{contact}*",
                            token=bot_token
                        )
                        continue
                    elif cb_data.startswith("collab_decline_"):
                        parts = cb_data.split("_")
                        app_id = parts[2]
                        try:
                            requests.put(f"{backend_url}/api/collab/applications/{app_id}/status?status=DECLINED", timeout=5)
                        except Exception as e:
                            logging.error(f"Error updating app status: {e}")
                            
                        answer_telegram_callback(cb_id, "❌ Collaboration Request Declined.", token=bot_token)
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"❌ *Collaboration Request Declined.*",
                            token=bot_token
                        )
                        continue
                    elif cb_data.startswith("collab_rm_"):
                        req_id = cb_data.replace("collab_rm_", "")
                        try:
                            requests.delete(f"{backend_url}/api/collab/{req_id}", timeout=5)
                            answer_telegram_callback(cb_id, "Request Removed!", token=bot_token)
                            edit_telegram_message(
                                cb_chat_id, cb_msg_id,
                                "✅ *Collaboration Request cancelled and removed from RIT Dev Hub.*",
                                token=bot_token
                            )
                        except Exception as e:
                            logging.error(f"Error removing collab request: {e}")
                        continue
                    
                    # Interactive Collab Wizard Callbacks
                    if cb_data.startswith("cflow_tag_"):
                        tag_key = cb_data.replace("cflow_tag_", "")
                        selected_tag = TAG_MAP.get(tag_key, TAG_MAP["1"])
                        USER_COLLAB_STATE[cb_chat_id] = {
                            "tag": selected_tag,
                            "dept": "CSE",
                            "year": "1st Year",
                            "collaboratorsNeeded": 1,
                            "step": "dept"
                        }
                        answer_telegram_callback(cb_id, "Tag Selected!", token=bot_token)
                        dept_keyboard = {
                            "inline_keyboard": [
                                [{"text": "CSE", "callback_data": "cflow_dept_CSE"}, {"text": "ECE", "callback_data": "cflow_dept_ECE"}, {"text": "AIML", "callback_data": "cflow_dept_AIML"}],
                                [{"text": "CSBS", "callback_data": "cflow_dept_CSBS"}, {"text": "MECH", "callback_data": "cflow_dept_MECH"}, {"text": "CIVIL", "callback_data": "cflow_dept_CIVIL"}],
                                [{"text": "AI & DS", "callback_data": "cflow_dept_AI & DS"}, {"text": "EEE", "callback_data": "cflow_dept_EEE"}, {"text": "IT", "callback_data": "cflow_dept_IT"}]
                            ]
                        }
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"📌 *Step 2 of 5: Select your Department*\n\nTag: `{selected_tag}`",
                            reply_markup=dept_keyboard,
                            token=bot_token
                        )
                        continue

                    if cb_data.startswith("cflow_dept_"):
                        dept_val = cb_data.replace("cflow_dept_", "")
                        if cb_chat_id not in USER_COLLAB_STATE:
                            USER_COLLAB_STATE[cb_chat_id] = {}
                        USER_COLLAB_STATE[cb_chat_id]["dept"] = dept_val
                        USER_COLLAB_STATE[cb_chat_id]["step"] = "year"
                        answer_telegram_callback(cb_id, "Department Selected!", token=bot_token)
                        yr_keyboard = {
                            "inline_keyboard": [
                                [{"text": "1st Year", "callback_data": "cflow_yr_1st Year"}, {"text": "2nd Year", "callback_data": "cflow_yr_2nd Year"}],
                                [{"text": "3rd Year", "callback_data": "cflow_yr_3rd Year"}, {"text": "4th Year", "callback_data": "cflow_yr_4th Year"}]
                            ]
                        }
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"📌 *Step 3 of 5: Select your Year*\n\nDepartment: `{dept_val}`",
                            reply_markup=yr_keyboard,
                            token=bot_token
                        )
                        continue

                    if cb_data.startswith("cflow_yr_"):
                        year_val = cb_data.replace("cflow_yr_", "")
                        if cb_chat_id not in USER_COLLAB_STATE:
                            USER_COLLAB_STATE[cb_chat_id] = {}
                        USER_COLLAB_STATE[cb_chat_id]["year"] = year_val
                        USER_COLLAB_STATE[cb_chat_id]["step"] = "num"
                        answer_telegram_callback(cb_id, "Year Selected!", token=bot_token)
                        
                        num_keyboard = {
                            "inline_keyboard": [
                                [{"text": "1 Collaborator", "callback_data": "cflow_num_1"}, {"text": "2 Collaborators", "callback_data": "cflow_num_2"}],
                                [{"text": "3 Collaborators", "callback_data": "cflow_num_3"}, {"text": "4 Collaborators", "callback_data": "cflow_num_4"}]
                            ]
                        }
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"📌 *Step 4 of 5: How many collaborators are you looking for?*",
                            reply_markup=num_keyboard,
                            token=bot_token
                        )
                        continue

                    if cb_data.startswith("cflow_num_"):
                        num_val = int(cb_data.replace("cflow_num_", ""))
                        if cb_chat_id not in USER_COLLAB_STATE:
                            USER_COLLAB_STATE[cb_chat_id] = {}
                        USER_COLLAB_STATE[cb_chat_id]["collaboratorsNeeded"] = num_val
                        USER_COLLAB_STATE[cb_chat_id]["step"] = "idea"
                        answer_telegram_callback(cb_id, "Count Selected!", token=bot_token)

                        st = USER_COLLAB_STATE[cb_chat_id]
                        edit_telegram_message(
                            cb_chat_id, cb_msg_id,
                            f"📌 *Step 5 of 5: Enter Project Idea & Name*\n\n"
                            f"🏷️ Tag: `{st.get('tag')}`\n"
                            f"🏫 Dept: `{st.get('dept')}` | Year: `{st.get('year')}`\n"
                            f"👥 Collaborators Needed: `{num_val}`\n\n"
                            f"💬 *Now reply to this chat with your details in this format:*\n"
                            f"`Name: Your Name`\n"
                            f"`Idea: Building an AI attendance app`\n"
                            f"`GitHub: https://github.com/...` (optional)\n",
                            token=bot_token
                        )
                        continue
                
                # 2. Standard Messages
                message = update.get("message")
                if not message:
                    continue
                    
                chat_id = message["chat"]["id"]
                text = message.get("text", "").strip()
                
                logging.info(f"Received message from chat {chat_id}: '{text}'")

                # Handle /remove command in Telegram
                if text.lower() in ["/remove", "/cancel"]:
                    try:
                        res = requests.get(f"{backend_url}/api/collab/active/telegram/{chat_id}", timeout=5)
                        if res.status_code == 200:
                            requests_list = res.json()
                            if not requests_list:
                                send_telegram_message(chat_id, "ℹ️ *You have no active collaboration requests to remove.*", token=bot_token)
                            else:
                                keyboard = []
                                for req_item in requests_list:
                                    req_id = req_item["id"]
                                    snippet = req_item.get("projectIdea", "Project")[:28]
                                    keyboard.append([{"text": f"❌ Cancel: {snippet}", "callback_data": f"collab_rm_{req_id}"}])
                                
                                rm_markup = {"inline_keyboard": keyboard}
                                send_telegram_message(chat_id, "🗑️ *Your Active Collaboration Requests*\n\nTap a request below to cancel and remove it from RIT Dev Hub:", reply_markup=rm_markup, token=bot_token)
                        else:
                            send_telegram_message(chat_id, "❌ Failed to fetch active requests.", token=bot_token)
                    except Exception as e:
                        send_telegram_message(chat_id, f"❌ Error: {e}", token=bot_token)
                    continue

                # Handle /collab Command or structured collab post
                if text.lower().startswith("/collab") or (chat_id in USER_COLLAB_STATE and USER_COLLAB_STATE[chat_id].get("step") == "idea"):
                    parsed = parse_collab_text(text)
                    st = USER_COLLAB_STATE.get(chat_id, {})
                    
                    author_name = parsed.get("authorName") or st.get("authorName")
                    dept = parsed.get("department") or st.get("dept") or "CSE"
                    year = parsed.get("year") or st.get("year") or "1st Year"
                    tag = parsed.get("tag") or st.get("tag") or TAG_MAP["1"]
                    num_needed = st.get("collaboratorsNeeded") or parsed.get("collaboratorsNeeded") or 1
                    idea = parsed.get("projectIdea")
                    github = parsed.get("githubLink")

                    if not idea:
                        tag_keyboard = {
                            "inline_keyboard": [
                                [{"text": "🚀 1. Co-develop from scratch", "callback_data": "cflow_tag_1"}],
                                [{"text": "🧪 2. Beta testers needed", "callback_data": "cflow_tag_2"}],
                                [{"text": "🌐 3. Open-source contributors", "callback_data": "cflow_tag_3"}]
                            ]
                        }
                        help_msg = (
                            f"🚀 *Post a Collaboration Request to RIT Dev Hub!*\n\n"
                            f"Tap a button below to select your project tag, or copy & reply with your details:"
                        )
                        send_telegram_message(chat_id, help_msg, reply_markup=tag_keyboard, token=bot_token)
                        continue
                    
                    user_name = message["from"].get("username")
                    first_name = message["from"].get("first_name", "")
                    author_display = author_name or first_name or "Student Developer"
                    contact_display = f"@{user_name}" if user_name else f"Telegram User #{chat_id}"
                    
                    payload = {
                        "authorName": author_display,
                        "department": dept,
                        "year": year,
                        "collaboratorsNeeded": num_needed,
                        "projectIdea": idea,
                        "githubLink": github or None,
                        "tag": tag,
                        "contactInfo": contact_display,
                        "telegramChatId": chat_id
                    }
                    
                    try:
                        res = requests.post(f"{backend_url}/api/collab", json=payload, timeout=10)
                        if res.status_code in [200, 201]:
                            resp_msg = (
                                f"🎉 *Collaboration Request Live on RIT Dev Hub!*\n\n"
                                f"👤 *Author:* {author_display} ({dept}, {year})\n"
                                f"📌 *Project Idea:* {idea}\n"
                                f"🏷️ *Tag:* `{tag}`\n"
                                f"👥 *Collaborators Looking For:* `{num_needed}`\n"
                                f"📱 *Telegram Contact:* {contact_display}\n\n"
                                f"When other developers apply on the website, you will receive a Telegram message right here to Accept or Decline!\n"
                                f"*(Type `/remove` anytime to cancel your active requests)*"
                            )
                            send_telegram_message(chat_id, resp_msg, force_reply=False, token=bot_token)
                            if chat_id in USER_COLLAB_STATE:
                                del USER_COLLAB_STATE[chat_id]
                        else:
                            send_telegram_message(chat_id, f"❌ Failed to save collab request (Status: {res.status_code})", token=bot_token)
                    except Exception as e:
                        send_telegram_message(chat_id, f"❌ Error saving collab request: {e}", token=bot_token)
                    continue

                # Welcome command
                if text == "/start":
                    welcome_text = (
                        f"👋 *Welcome to the RIT Chatbot 24/7!*\n\n"
                        f"⚠️ *Please note: Answers generated by AI may occasionally be inaccurate or wrong. Always verify critical academic or administrative details with official campus sources.*\n\n"
                        f"I can help you answer any questions about RIT Chennai — courses, hostels, transport, sports, and more.\n\n"
                        f"🚀 *Developer Collaboration:* Type `/collab` to post your project idea!\n"
                        f"🗑️ *Remove Request:* Type `/remove` to cancel your active requests.\n\n"
                        f"💬 *Or just type your question here!*"
                    )
                    send_telegram_message(chat_id, welcome_text, force_reply=False, token=bot_token)
                    continue

                # Direct chat fallback with Go chatbot service
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
            logging.error(f"Error in 24/7 chatbot polling loop: {e}")
            time.sleep(5)

# Discord Action View for Collaboration Applications
class DiscordCollabActionView(discord.ui.View):
    def __init__(self, application_id: int, applicant_contact: str):
        super().__init__(timeout=86400)
        self.application_id = application_id
        self.applicant_contact = applicant_contact

    @discord.ui.button(label="Accept Collaboration", style=discord.ButtonStyle.success, emoji="✅")
    async def accept_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        try:
            requests.put(f"{BACKEND_URL}/api/collab/applications/{self.application_id}/status?status=ACCEPTED", timeout=5)
            await interaction.response.send_message(
                f"✅ **Collaboration Request Accepted!**\nDirect contact details: **{self.applicant_contact}**",
                ephemeral=False
            )
            for item in self.children:
                item.disabled = True
            await interaction.message.edit(view=self)
        except Exception as e:
            await interaction.response.send_message(f"❌ Error updating status: {e}", ephemeral=True)

    @discord.ui.button(label="Decline Request", style=discord.ButtonStyle.danger, emoji="❌")
    async def decline_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        try:
            requests.put(f"{BACKEND_URL}/api/collab/applications/{self.application_id}/status?status=DECLINED", timeout=5)
            await interaction.response.send_message("❌ **Collaboration Request Declined.**", ephemeral=False)
            for item in self.children:
                item.disabled = True
            await interaction.message.edit(view=self)
        except Exception as e:
            await interaction.response.send_message(f"❌ Error updating status: {e}", ephemeral=True)

async def broadcast_discord_collab_application(application_id: int, project_idea: str, tag: str, applicant_name: str, applicant_dept: str, applicant_year: str, applicant_contact: str, message: str, user_ids: list):
    formatted_msg = (
        f"🤝 **New Collaboration Request for your Project!**\n\n"
        f"📌 **Project Idea:** {project_idea}\n"
        f"🏷️ **Tag:** `{tag}`\n\n"
        f"👤 **Applicant:** {applicant_name} ({applicant_dept}, {applicant_year})\n"
        f"💬 **Message:** {message or 'No message provided'}\n"
        f"📱 **Contact Info:** {applicant_contact}\n\n"
        f"Click a button below to respond:"
    )
    view = DiscordCollabActionView(application_id, applicant_contact)
    for user_id_val in user_ids:
        try:
            user_id = int(user_id_val)
            user = await discord_client.fetch_user(user_id)
            if user:
                await user.send(content=formatted_msg, view=view)
                logging.info(f"Sent Discord collab notification DM to user {user_id}")
        except Exception as e:
            logging.error(f"Failed to send Discord collab DM to {user_id_val}: {e}")

# Discord Remove Select View
class DiscordCollabRemoveSelect(discord.ui.Select):
    def __init__(self, active_requests: list):
        options = []
        for req in active_requests:
            req_id = str(req["id"])
            snippet = req.get("projectIdea", "Project")[:45]
            options.append(discord.SelectOption(
                label=f"Cancel: {snippet}",
                value=req_id,
                description=f"Tag: {req.get('tag')} | Dept: {req.get('department')}",
                emoji="❌"
            ))
        super().__init__(placeholder="Select a request to remove...", min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        req_id = self.values[0]
        try:
            res = requests.delete(f"{BACKEND_URL}/api/collab/{req_id}", timeout=5)
            if res.status_code in [200, 204]:
                await interaction.response.send_message("✅ **Collaboration Request cancelled and removed from RIT Dev Hub.**", ephemeral=False)
            else:
                await interaction.response.send_message("❌ Failed to cancel request.", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"❌ Error: {e}", ephemeral=True)

class DiscordCollabRemoveView(discord.ui.View):
    def __init__(self, active_requests: list):
        super().__init__(timeout=180)
        self.add_item(DiscordCollabRemoveSelect(active_requests))

# Discord Native Interactive UI Components (Modal & Dropdown View)
class CollabModal(discord.ui.Modal, title="Post Collaboration Request"):
    author_name = discord.ui.TextInput(label="1) Your Name", placeholder="e.g. Priyan Sharma", required=True)
    dept_and_year = discord.ui.TextInput(label="2) Dept & Year", placeholder="e.g. CSE, 1st Year", required=True, default="CSE, 1st Year")
    collaborators_needed = discord.ui.TextInput(label="3) Collaborators Needed", placeholder="e.g. 2", required=True, default="1")
    project_idea = discord.ui.TextInput(label="4) Project Idea & Details", style=discord.TextStyle.paragraph, placeholder="Describe your project idea...", required=True)
    github_link = discord.ui.TextInput(label="5) GitHub Link (Optional)", placeholder="https://github.com/...", required=False)

    def __init__(self, tag: str):
        super().__init__()
        self.selected_tag = tag

    async def on_submit(self, interaction: discord.Interaction):
        try:
            num_needed = int(self.collaborators_needed.value)
        except ValueError:
            num_needed = 1

        dept_val = "CSE"
        year_val = "1st Year"
        if "," in self.dept_and_year.value:
            parts = [p.strip() for p in self.dept_and_year.value.split(",", 1)]
            dept_val = parts[0]
            year_val = parts[1]
        else:
            dept_val = self.dept_and_year.value.strip()

        payload = {
            "authorName": self.author_name.value,
            "department": dept_val,
            "year": year_val,
            "collaboratorsNeeded": num_needed,
            "tag": self.selected_tag,
            "projectIdea": self.project_idea.value,
            "githubLink": self.github_link.value or None,
            "contactInfo": f"Discord: {interaction.user.name}",
            "discordUserId": str(interaction.user.id)
        }
        try:
            res = requests.post(f"{BACKEND_URL}/api/collab", json=payload, timeout=10)
            if res.status_code in [200, 201]:
                await interaction.response.send_message(
                    f"🎉 **Collaboration Request posted live to RIT Dev Hub!**\n"
                    f"👤 **Author:** {self.author_name.value} ({dept_val}, {year_val})\n"
                    f"📌 **Project:** {self.project_idea.value}\n"
                    f"🏷️ **Tag:** `{self.selected_tag}`\n"
                    f"👥 **Collaborators Needed:** `{num_needed}`",
                    ephemeral=False
                )
            else:
                await interaction.response.send_message(f"❌ Failed to save request (Status: {res.status_code})", ephemeral=True)
        except Exception as e:
            await interaction.response.send_message(f"❌ Error connecting to backend: {e}", ephemeral=True)

class CollabTagSelect(discord.ui.Select):
    def __init__(self):
        options = [
            discord.SelectOption(
                label="Co-developing from scratch",
                value="looking for co-developing a project from scratch",
                description="Build a brand new project from scratch together",
                emoji="🚀"
            ),
            discord.SelectOption(
                label="Beta Testers needed",
                value="looking for beta testers",
                description="Test early builds and provide user feedback",
                emoji="🧪"
            ),
            discord.SelectOption(
                label="Open-Source Contributors",
                value="looking for Open-source Collaborators/Contributers",
                description="Open repository seeking PRs and contributors",
                emoji="🌐"
            ),
        ]
        super().__init__(placeholder="Scroll down to select a tag for your request...", min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        selected_tag = self.values[0]
        modal = CollabModal(tag=selected_tag)
        await interaction.response.send_modal(modal)

class CollabView(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=180)
        self.add_item(CollabTagSelect())

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
        mention_str = f"<@{discord_client.user.id}>"
        mention_nick_str = f"<@!{discord_client.user.id}>"
        content = content.replace(mention_str, "").replace(mention_nick_str, "").strip()

    # Discord /collab & /remove commands disabled as requested
    if content.lower().startswith("/collab") or content.lower().startswith("/remove") or content.lower().startswith("/cancel"):
        await message.reply("ℹ️ **Dev Hub collaboration requests via Discord are currently disabled.** Please use the RIT Dev Hub website (https://rit-services.in/dev-collab) or the Telegram bot (@Ritchatbot_bot).")
        return

    # Check if this message is a reply to a question DM sent to a helper
    if message.reference and message.reference.message_id:
        question_id = get_question_id(message.author.id, message.reference.message_id)
        if question_id:
            author_name = message.author.display_name or message.author.name or "Senior Helper"
            logging.info(f"Submitting answer for question {question_id} by Discord helper '{author_name}'")
            backend_endpoint = f"{BACKEND_URL}/api/questions/{question_id}/answers"
            answer_payload = {
                "body": content,
                "author": author_name
            }
            try:
                def call_backend():
                    return requests.post(backend_endpoint, json=answer_payload, timeout=10)

                loop = asyncio.get_event_loop()
                res = await loop.run_in_executor(None, call_backend)
                if res.status_code in [200, 201]:
                    await message.reply("✅ **Answer posted successfully to the Q&A board!**")
                else:
                    await message.reply(f"❌ **Failed to post answer to backend.** (Status: {res.status_code})")
            except Exception as e:
                logging.error(f"Error calling backend endpoint {backend_endpoint}: {e}")
                await message.reply(f"❌ **Connection error to backend.** ({e})")
            return

    # Direct query fallback to Go chatbot service
    if not content.strip():
        return

    logging.info(f"Querying Go chatbot service for Discord user {message.author.id}: '{content}'")
    chatbot_service_url = "http://localhost:8081/api/chat"
    try:
        def call_chatbot():
            return requests.post(chatbot_service_url, json={"message": content}, timeout=10)

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

class CollabApplicationPayload(BaseModel):
    collab_id: int
    application_id: int
    project_idea: str
    tag: str
    author_name: str
    contact_info: Optional[str] = None
    telegram_chat_id: Optional[int] = None
    discord_user_id: Optional[str] = None
    applicant_name: str
    applicant_dept: str
    applicant_year: str
    applicant_contact: str
    message: Optional[str] = None

@app.post("/send_question")
def send_question(payload: QuestionPayload):
    current_config = load_config()
    comm_token = os.environ.get("COMMUNITY_BOT_TOKEN") or current_config.get("community_bot_token", COMMUNITY_BOT_TOKEN)
    
    # 1. Telegram Broadcast via Senior Helper Community Bot
    telegram_helpers = current_config.get("helper_chat_ids", [])
    telegram_sent = 0
    if telegram_helpers and comm_token:
        logging.info(f"Broadcasting question {payload.question_id} to {len(telegram_helpers)} Telegram helpers via Senior Bot.")
        formatted_msg = (
            f"❓ *New Student Question!*\n\n"
            f"👤 *Author:* {payload.author}\n"
            f"📌 *Topic:* {payload.title}\n"
            f"📝 *Details:* {payload.body}\n\n"
            f"💬 *Reply to this message directly to submit your answer to the Q&A board.*"
        )
        for chat_id in telegram_helpers:
            res = send_telegram_message(chat_id, formatted_msg, force_reply=True, token=comm_token)
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

@app.post("/send_collab_application")
def send_collab_application(payload: CollabApplicationPayload):
    current_config = load_config()
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN") or current_config.get("telegram_bot_token")
    
    telegram_sent = False
    discord_sent = False

    # 1. Telegram Notification strictly to Person A (the project author)
    chat_id = payload.telegram_chat_id

    if chat_id:
        msg_text = (
            f"🤝 *New Collaboration Request for your Project!*\n\n"
            f"📌 *Project Idea:* {payload.project_idea}\n"
            f"🏷️ *Tag:* `{payload.tag}`\n\n"
            f"👤 *Applicant:* {payload.applicant_name} ({payload.applicant_dept}, {payload.applicant_year})\n"
            f"💬 *Message:* {payload.message or 'No message provided'}\n"
            f"📱 *Contact Info:* {payload.applicant_contact}\n\n"
            f"Click a button below to respond:"
        )
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "✅ Accept Collaboration", "callback_data": f"collab_accept_{payload.application_id}_{payload.applicant_contact}"},
                    {"text": "❌ Decline Request", "callback_data": f"collab_decline_{payload.application_id}"}
                ]
            ]
        }
        res = send_telegram_message(chat_id, msg_text, reply_markup=reply_markup, token=bot_token)
        if res.get("ok"):
            telegram_sent = True
    else:
        logging.info(f"Skipping Telegram notification for collab application {payload.application_id}: No telegram_chat_id provided for author.")

    # 2. Discord Broadcast - Disabled as requested
    discord_sent = False

    return {
        "status": "success",
        "telegram_sent": telegram_sent,
        "discord_sent": discord_sent
    }

async def run_uvicorn():
    config = uvicorn.Config(app, host="0.0.0.0", port=8082, loop="asyncio")
    server = uvicorn.Server(config)
    await server.serve()

async def main():
    comm_thread = threading.Thread(target=community_bot_polling_thread, daemon=True)
    comm_thread.start()

    chat_thread = threading.Thread(target=telegram_polling_thread, daemon=True)
    chat_thread.start()

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
