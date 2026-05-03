"""
Election Buddy AI — Backend v2
================================
- Groq (Llama 3.3 70B) — FREE cloud AI
- Full conversation history per session
- Last 3 pairs sent to AI (memory management)
- Live news via RSS feeds
- Sidebar-ready session list endpoint
"""

import os
import uuid
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import httpx
from dotenv import load_dotenv

load_dotenv(override=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("election_buddy")

# ── Config ────────────────────────────────────────────────────────────────────
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "").strip()
PORT           = int(os.getenv("PORT", 8000))
GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions"
MODEL          = "llama-3.3-70b-versatile"
AI_CONTEXT_PAIRS = 3   # Only last 3 user+assistant pairs sent to AI

if GROQ_API_KEY.startswith("gsk_"):
    logger.info(f"Groq key loaded: {GROQ_API_KEY[:8]}...")
else:
    logger.warning("GROQ_API_KEY missing. Get one free at console.groq.com")

# ── Live News (free RSS, cached 20 min) ───────────────────────────────────────
NEWS_FEEDS = [
    ("NDTV",          "https://feeds.feedburner.com/ndtvnews-india-news"),
    ("Times of India","https://timesofindia.indiatimes.com/rssfeedstopstories.cms"),
    ("The Hindu",     "https://www.thehindu.com/news/national/feeder/default.rss"),
]
_news_cache: dict = {"headlines": [], "fetched_at": None}


def fetch_live_news(max_items: int = 6) -> list:
    global _news_cache
    now = datetime.now(timezone.utc)
    if (
        _news_cache["fetched_at"]
        and (now - _news_cache["fetched_at"]) < timedelta(minutes=20)
        and _news_cache["headlines"]
    ):
        return _news_cache["headlines"]

    headlines = []
    for source, url in NEWS_FEEDS:
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(url, headers={"User-Agent": "ElectionBuddyAI/2.0"})
            if resp.status_code != 200:
                continue
            root = ET.fromstring(resp.text)
            for item in root.findall(".//item/title")[:3]:
                title = (item.text or "").strip()
                if title and len(title) > 10:
                    headlines.append(f"[{source}] {title}")
        except Exception as e:
            logger.warning(f"News fetch failed ({source}): {e}")
        if len(headlines) >= max_items:
            break

    if headlines:
        _news_cache = {"headlines": headlines[:max_items], "fetched_at": now}
        logger.info(f"Fetched {len(headlines)} live headlines")
    return _news_cache["headlines"]


# ── System Prompt (dynamic) ───────────────────────────────────────────────────
def get_system_prompt() -> str:
    now = datetime.now(timezone.utc)
    current_date = now.strftime("%A, %d %B %Y")
    current_year = now.year
    headlines = fetch_live_news()
    news_section = (
        "## LIVE NEWS HEADLINES (Today)\n" + "\n".join(f"- {h}" for h in headlines)
        if headlines
        else "## LIVE NEWS\n- Headlines unavailable right now."
    )

    return f"""You are Election Buddy AI, a confident, intelligent assistant for India.
You answer questions about elections, current affairs, politics, economy, and more.

## TODAY
- Date: {current_date} | Year: {current_year}
- Lok Sabha 2024: COMPLETED. Maharashtra Assembly 2024: COMPLETED.
- NEVER call 2024 elections "upcoming" - they are past events.
- India follows a 5-year election cycle.

{news_section}

## HOW TO RESPOND
- Give a direct answer FIRST (1-2 lines), then add context.
- Use bullet points and headings. Keep it clean and scannable.
- Be confident and natural - not robotic or overly cautious.
- For dates/results: estimate intelligently if unsure, then note the source.
- Emojis only where they genuinely help.

## SCOPE
You can answer about: Indian elections, current news, politics, economy, sports,
science, tech - any topic relevant to Indian citizens.
""".strip()


# ── Session Store ─────────────────────────────────────────────────────────────
# Structure:
# sessions[session_id] = {
#   "id": str,
#   "title": str,          # auto-generated from first message
#   "created_at": str,
#   "messages": [          # FULL history for display
#     {"role": "user"|"assistant", "content": str, "timestamp": str}
#   ]
# }
sessions: dict = {}


def create_session(first_message: str) -> dict:
    sid = str(uuid.uuid4())
    title = first_message[:45] + ("..." if len(first_message) > 45 else "")
    session = {
        "id": sid,
        "title": title,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": [],
    }
    sessions[sid] = session
    logger.info(f"New session: {sid[:8]} — '{title}'")
    return session


def get_ai_context(session: dict) -> list:
    """Return only last AI_CONTEXT_PAIRS pairs for the AI call (memory management)."""
    all_msgs = session["messages"]
    # Filter to user+assistant messages only, take last N pairs
    pairs = []
    i = 0
    while i < len(all_msgs):
        if all_msgs[i]["role"] == "user":
            user_msg = {"role": "user", "content": all_msgs[i]["content"]}
            if i + 1 < len(all_msgs) and all_msgs[i + 1]["role"] == "assistant":
                pairs.append((user_msg, {"role": "assistant", "content": all_msgs[i + 1]["content"]}))
                i += 2
            else:
                pairs.append((user_msg, None))
                i += 1
        else:
            i += 1
    # Take last N pairs
    recent = pairs[-AI_CONTEXT_PAIRS:]
    context = []
    for pair in recent:
        context.append(pair[0])
        if pair[1]:
            context.append(pair[1])
    return context


def serialize_session(session: dict) -> dict:
    """Return a safe JSON-serializable version of a session."""
    return {
        "id": session["id"],
        "title": session["title"],
        "created_at": session["created_at"],
        "message_count": len(session["messages"]),
        "messages": session["messages"],
    }


# ── Flask App ─────────────────────────────────────────────────────────────────
# Point to the React production build folder
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "frontend-react", "dist"))

# We set static_folder to the assets folder inside dist, or just dist
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)


# ── Static / SPA Routing ──────────────────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    # 1. Check if the file exists in the dist folder (e.g. assets/index.js)
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    
    # 2. Otherwise, serve index.html (Standard SPA behavior)
    # This ensures that /chat, /sessions etc. are NOT caught here 
    # because Flask matches specific routes FIRST.
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/favicon.ico")
def favicon():
    return send_from_directory(FRONTEND_DIR, "favicon.ico") if os.path.exists(os.path.join(FRONTEND_DIR, "favicon.ico")) else ("", 204)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model": MODEL,
        "active_sessions": len(sessions),
        "live_headlines": len(_news_cache["headlines"]),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


# ── GET /sessions — list all sessions (for sidebar) ──────────────────────────
@app.route("/sessions", methods=["GET"])
def list_sessions():
    """Return all sessions sorted newest-first for the sidebar."""
    session_list = [
        {"id": s["id"], "title": s["title"], "created_at": s["created_at"],
         "message_count": len(s["messages"])}
        for s in sessions.values()
    ]
    session_list.sort(key=lambda x: x["created_at"], reverse=True)
    return jsonify({"sessions": session_list})


# ── GET /session/<id> — load a specific session ───────────────────────────────
@app.route("/session/<session_id>", methods=["GET"])
def get_session(session_id):
    if session_id not in sessions:
        return jsonify({"detail": "Session not found."}), 404
    return jsonify(serialize_session(sessions[session_id]))


# ── DELETE /session/<id> ──────────────────────────────────────────────────────
@app.route("/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    if session_id in sessions:
        del sessions[session_id]
        return jsonify({"message": "Session deleted."})
    return jsonify({"detail": "Session not found."}), 404


# ── POST /chat — main chat endpoint ──────────────────────────────────────────
@app.route("/chat", methods=["POST"])
def chat():
    if not GROQ_API_KEY:
        return jsonify({"detail": "GROQ_API_KEY missing. Get one free at console.groq.com"}), 503

    data        = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    session_id   = (data.get("session_id") or "").strip()

    if not user_message:
        return jsonify({"detail": "Message cannot be empty."}), 400
    if len(user_message) > 2000:
        return jsonify({"detail": "Message too long (max 2000 chars)."}), 400

    # Get or create session
    if not session_id or session_id not in sessions:
        session = create_session(user_message)
        session_id = session["id"]
    else:
        session = sessions[session_id]

    # Build AI messages: system + last 3 context pairs + new message
    ai_context = get_ai_context(session)
    messages = [{"role": "system", "content": get_system_prompt()}]
    messages.extend(ai_context)
    messages.append({"role": "user", "content": user_message})

    logger.info(f"[{session_id[:8]}] {user_message[:60]}")

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "messages": messages,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "stream": False,
                },
            )

        res_data = response.json()
        if response.status_code != 200:
            error_msg = res_data.get("error", {}).get("message", "Unknown Groq error")
            logger.error(f"Groq Error [{response.status_code}]: {error_msg}")
            return jsonify({"detail": f"API Error: {error_msg}"}), 502

        ai_reply = res_data["choices"][0]["message"]["content"].strip()
        now_str  = datetime.now(timezone.utc).isoformat()

        # Append to full session history
        session["messages"].append({"role": "user",      "content": user_message, "timestamp": now_str})
        session["messages"].append({"role": "assistant", "content": ai_reply,     "timestamp": now_str})

        logger.info(f"[{session_id[:8]}] replied ({len(ai_reply)} chars)")

        return jsonify({
            "reply":      ai_reply,
            "session_id": session_id,
            "title":      session["title"],
            "timestamp":  now_str,
            "model":      MODEL,
            "history":    session["messages"],
        })

    except httpx.TimeoutException:
        return jsonify({"detail": "Request timed out. Please try again."}), 504
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({"detail": f"Server error: {str(e)}"}), 500


@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled: {e}")
    return jsonify({"detail": "An unexpected error occurred."}), 500


if __name__ == "__main__":
    logger.info(f"Election Buddy AI v2 starting on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
