# 🤖 HR Onboarding Agent

An AI-powered HR onboarding platform that uses four specialized agents to automatically generate personalized onboarding plans for new employees — completely free to run locally.

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![CrewAI](https://img.shields.io/badge/CrewAI-Latest-green?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-Llama3.1-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

- **4 AI agents** working together to generate a complete onboarding plan
- **Company customization** — recruiters can configure company-specific tools, documents, and processes
- **Role-specific 3-month training plan** tailored to the employee's job title
- **Beautiful dark UI** built with React + Vite
- **Email delivery** — send the onboarding plan directly to the new employee
- **PDF/text download** of the complete onboarding plan
- **100% free** — runs locally using Ollama + Llama 3.1, no API costs

---

## 🤖 The Four Agents

| Agent | Role |
|---|---|
| 👋 HR Coordinator | Writes a personalized welcome message with day 1 instructions |
| 📄 Document Manager | Lists all documents the employee needs to sign with deadlines |
| 💻 IT Setup Agent | Creates a checklist of tools, software, and accounts to set up |
| 🎓 Training Coordinator | Builds a detailed 3-month training plan specific to the role |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Axios |
| Backend | Python + Flask + Flask-CORS |
| AI Framework | CrewAI |
| LLM | Llama 3.1 8B via Ollama (free, local) |
| Memory | ChromaDB + SQLite |
| Styling | Custom CSS (dark theme) |

---

## 📋 Prerequisites

- macOS / Linux / Windows
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) installed

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hr-onboarding-agent.git
cd hr-onboarding-agent
```

### 2. Set up Python environment

```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install --upgrade pip
pip install crewai flask flask-cors langchain-ollama chromadb
```

### 3. Install and start Ollama

Download Ollama from [ollama.com](https://ollama.com) then run:

```bash
ollama pull llama3.1:8b
ollama serve
```

### 4. Set up the React frontend

```bash
cd frontend
npm install
npm install axios
```

---

## 📁 Project Structure

```
hr-onboarding-agent/
├── backend.py              # Flask API + CrewAI agents
├── hr_agent.py             # Standalone agent (CLI version)
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   └── App.css         # Styling
│   ├── package.json
│   └── vite.config.js
├── venv/                   # Python virtual environment
└── README.md
```

---
