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

<img width="1118" height="734" alt="Screenshot 2026-11-18 at 7 53 24 PM" src="https://github.com/user-attachments/assets/e7854930-93c7-4dba-80b5-b09de2b18d59" />
<img width="1122" height="925" alt="Screenshot 2026-11-18 at 7 54 02 PM" src="https://github.com/user-attachments/assets/ab1360b4-f61d-4f09-9c6e-ba87f83118a3" />


| 📄 Document Manager | Lists all documents the employee needs to sign with deadlines |

<img width="1102" height="874" alt="Screenshot 2026-11-18 at 7 54 33 PM" src="https://github.com/user-attachments/assets/b20b7ee5-b08d-4a5d-ad5e-0cd22f769263" />
<img width="1115" height="858" alt="Screenshot 2026-11-18 at 7 54 51 PM" src="https://github.com/user-attachments/assets/e93724e7-5bad-4aee-bc2d-f86b56ac26f2" />


| 💻 IT Setup Agent | Creates a checklist of tools, software, and accounts to set up |

<img width="1116" height="924" alt="Screenshot 2026-11-18 at 7 55 00 PM" src="https://github.com/user-attachments/assets/f807bd48-8536-4b15-a99b-c909cdd84fc3" />
<img width="1159" height="949" alt="Screenshot 2026-11-18 at 7 55 09 PM" src="https://github.com/user-attachments/assets/29dcc038-2b4d-4d3d-aab7-01e8303a2ee4" />


| 🎓 Training Coordinator | Builds a detailed 3-month training plan specific to the role |

<img width="1151" height="956" alt="Screenshot 2026-11-18 at 7 55 21 PM" src="https://github.com/user-attachments/assets/fe7ecbc5-05d7-40a9-b3dc-8c26afaf08f5" />
<img width="1098" height="941" alt="Screenshot 2026-11-18 at 7 55 31 PM" src="https://github.com/user-attachments/assets/5313d91e-6440-46ce-9bd0-117119749798" />
<img width="1134" height="934" alt="Screenshot 2026-11-18 at 7 56 03 PM" src="https://github.com/user-attachments/assets/f5a5ef49-6989-47d5-a73c-a78b89dc0e29" />
<img width="1148" height="956" alt="Screenshot 2026-11-18 at 7 55 42 PM" src="https://github.com/user-attachments/assets/ecf51088-d567-463b-8bf3-66ebc441fb2e" />


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
