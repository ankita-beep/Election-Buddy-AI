# 🗳️ Election Buddy AI — Production Ready

> A high-performance, AI-powered election assistant for India. Built for hackathons, designed for production.

---

## 🏗️ Deployment Architecture

This application is decoupled for maximum scalability and zero-cost hosting:

1.  **Backend (Python/Flask)**
    *   **Host:** Render
    *   **AI:** Groq (Llama 3.3 70B — Ultra Fast & Free)
    *   **Features:** Session management, RSS live news integration, CORS enabled.

2.  **Frontend (React/Vite)**
    *   **Host:** Netlify
    *   **UI:** Glassmorphism, Framer Motion animations, Lucide icons.
    *   **Communication:** Axios with environment-based API URL.

---

## 📂 Project Structure

```
AI-election-agent/
├── backend/
│   ├── main.py          # Flask API server
│   ├── requirements.txt  # Python dependencies (includes Gunicorn)
│   └── .env.example     # Template for GROQ_API_KEY
├── frontend/
│   ├── src/             # React source code
│   ├── public/          # Static assets
│   ├── package.json     # Node dependencies
│   └── .env.example     # Template for VITE_API_BASE_URL
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Backend (Render)
1. Push your code to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your repository.
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn main:app`
5. **Environment Variables:**
   - `GROQ_API_KEY`: Your key from [console.groq.com](https://console.groq.com).
   - `PYTHON_VERSION`: `3.10` or higher.

### 2. Frontend (Netlify)
1. Create a new site on [Netlify](https://netlify.com) from GitHub.
2. Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. **Environment Variables:**
   - `VITE_API_BASE_URL`: The URL of your backend on Render (e.g., `https://election-buddy-api.onrender.com`).

---

## 🛠️ Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Documentation

### `POST /chat`
**Payload:**
```json
{
  "message": "Who is the Prime Minister?",
  "session_id": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "...",
  "session_id": "...",
  "timestamp": "..."
}
```

---

## 🎨 Design Philosophy
- **Rich Aesthetics:** Dark mode by default with white/zinc accents.
- **Glassmorphism:** Frosted glass headers and sidebars.
- **Micro-animations:** Smooth transitions using Framer Motion.
- **Clean UI:** No clutter, focus on readability and scannable content.

---

## 📄 License
MIT
