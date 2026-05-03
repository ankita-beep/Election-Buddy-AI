# 🗳️ Election Buddy AI

> An AI-powered assistant that helps users understand India's election process — beginner-friendly, structured, and interactive.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)
![Stack](https://img.shields.io/badge/AI-OpenAI%20GPT--4o--mini-412991?style=flat&logo=openai)
![Stack](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-F7DF1E?style=flat&logo=javascript)

---

## ✨ Features

- 🧠 **AI Agent** powered by GPT-4o-mini with custom system prompt
- 💬 **Conversation Memory** — maintains chat context per session
- 🎨 **Premium Dark UI** — glassmorphism, gradient animations, particle effects
- 📱 **Fully Responsive** — works on mobile and desktop
- ⚡ **Quick Action Buttons** — one-click starter questions
- 🔐 **Secure** — API key never exposed to frontend
- 📋 **Structured Responses** — headings, bullets, step-by-step

---

## 📦 Project Structure

```
AI-election-agent/
├── backend/
│   └── main.py          # FastAPI server + OpenAI agent
├── frontend/
│   ├── index.html       # Chat UI
│   ├── style.css        # Design system
│   └── script.js        # Frontend logic
├── .env                 # API keys (never commit!)
├── .env.example         # Template
├── requirements.txt     # Python dependencies
└── README.md
```

---

## 🚀 Local Setup

### 1. Clone & Enter

```bash
git clone <your-repo-url>
cd AI-election-agent
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=1024
PORT=8000
```

### 5. Run the Server

```bash
cd backend
python main.py
```

Open your browser: **http://localhost:8000**

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/`             | Serves frontend |
| `GET`  | `/health`       | Health check |
| `POST` | `/chat`         | Send a message |
| `DELETE` | `/session/{id}` | Clear session |
| `GET`  | `/api/docs`     | Swagger UI |

### POST /chat — Request Body
```json
{
  "message": "How do I vote in India?",
  "session_id": "optional-uuid"
}
```

### POST /chat — Response
```json
{
  "reply": "## How to Vote in India...",
  "session_id": "abc-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "model": "gpt-4o-mini"
}
```

---

## 🧪 Sample Questions

- "How do I vote in India?"
- "Who can vote? What are the eligibility criteria?"
- "Explain the complete election process step by step"
- "What is the Election Commission of India?"
- "How do I get a Voter ID card online?"
- "What is NOTA?"
- "Difference between Lok Sabha and Rajya Sabha elections?"

---

## ☁️ Deployment

### Option A — Render (Recommended, Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Set:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:** Add `OPENAI_API_KEY`

### Option B — Railway

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → GitHub Repo
3. Add env vars in the Variables tab
4. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option C — Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t election-buddy .
docker run -p 8000:8000 --env-file .env election-buddy
```

---

## 🔐 Security Notes

- Never commit `.env` to git (it's in `.gitignore`)
- OpenAI key stays on backend only
- Add rate limiting for production (e.g., `slowapi`)
- Restrict CORS origins in production

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Model | OpenAI GPT-4o-mini |
| Backend | Python + FastAPI + Uvicorn |
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Fonts | Google Fonts (Inter, Outfit) |

---

## 📄 License

MIT — Free to use and modify.
