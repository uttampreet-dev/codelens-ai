# 🚀 CodeLens AI

> Instantly understand any code with AI-powered explanations, bug detection, and optimization insights.

CodeLens AI is an AI-powered developer tool that analyzes any code snippet and returns a structured, context-aware explanation using a Retrieval-Augmented Generation (RAG) pipeline powered by Google Gemini Flash.

---

## 🌐 Live Demo

🔗 https://codelens-ai-omega.vercel.app/

---

## 🖼️ Preview

Experience how CodeLens AI transforms raw code into clear, structured insights in seconds.

* Paste any code snippet
* Click **"Explain Code"**
* Instantly view explanation, breakdown, and suggestions

### 🎬 Demo

![CodeLens AI Demo](https://s2.ezgif.com/tmp/ezgif-246e93a241cf6550.gif)

---

## 🧠 Why CodeLens AI?

Understanding unfamiliar code is one of the biggest pain points for developers.
CodeLens AI helps by:

* Providing **instant explanations**
* Breaking down code **line-by-line**
* Detecting **bugs and inefficiencies**
* Suggesting **optimized solutions**

---

## ⚙️ How It Works

1. User pastes code into the editor
2. Frontend sends request to FastAPI backend
3. Code is converted into embeddings
4. ChromaDB retrieves relevant context
5. Gemini Flash generates explanation
6. Structured response is shown in UI

---

## ✨ Features

* ⚡ Instant AI-powered explanations
* 🧩 Line-by-line breakdown
* 🐞 Bug detection
* 🚀 Optimization suggestions
* 📊 Complexity analysis
* 🌍 Multi-language support
* 🧠 RAG-powered results

---

## 🏗️ Architecture

```
Frontend (React)
        ↓
FastAPI Backend
        ↓
Embeddings (sentence-transformers)
        ↓
ChromaDB (vector search)
        ↓
Gemini Flash (explanation)
        ↓
Response → UI
```

---

## 🛠️ Tech Stack

| Layer      | Tools                                            |
| ---------- | ------------------------------------------------ |
| Frontend   | React, TypeScript, Vite, Tailwind, Monaco Editor |
| Backend    | FastAPI, Uvicorn, Python                         |
| Vector DB  | ChromaDB                                         |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2)         |
| AI Model   | Google Gemini Flash                              |

---

## 📦 Local Development

### Frontend

```bash
npm install
npm run dev
```

Create `.env`:

```
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Runs at: http://localhost:5173

---

### Backend

```bash
pip install fastapi uvicorn chromadb sentence-transformers google-generativeai python-dotenv
python seed_data.py
uvicorn main:app --reload
```

Create `.env`:

```
GEMINI_API_KEY=your_gemini_api_key
```

Runs at: http://localhost:8000
Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
.
├─ src/              # React frontend source
│  ├─ components/    # UI components (editor, results panel)
│  ├─ pages/         # Landing page and workspace
│  └─ integrations/  # External service configs
├─ public/           # Static assets
├─ index.html        # App entry point
└─ package.json      # Frontend dependencies
```

---

## 🚀 Deployment

* **Frontend** — Vercel (auto-deploy from GitHub)
* **Backend** — Replit (persistent ChromaDB + RAG pipeline)

⚠️ Make sure frontend uses your deployed backend URL in production.

---

## 🔮 Future Improvements

* Chat with code
* GitHub repo analysis
* Code visualization

---


