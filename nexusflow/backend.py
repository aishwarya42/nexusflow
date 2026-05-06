from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from crewai import Agent, Task, Crew
import bcrypt
import threading
import queue
import sqlite3
from database import get_db, init_db

app = Flask(__name__)
CORS(app, origins="*")
app.config["JWT_SECRET_KEY"] = "hr-agent-secret-key-change-in-production"
jwt = JWTManager(app)

# Initialize database on startup
init_db()

# ── Auth routes ───────────────────────────────────────────────────────────────

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_db()
        conn.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed))
        conn.commit()
        conn.close()
        token = create_access_token(identity=email)
        return jsonify({"status": "success", "token": token})
    except sqlite3.IntegrityError:
        return jsonify({"status": "error", "message": "Email already registered"}), 400

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401

    token = create_access_token(identity=email)
    return jsonify({"status": "success", "token": token})

# ── History route ─────────────────────────────────────────────────────────────

@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    email = get_jwt_identity()
    conn  = get_db()
    user  = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    plans = conn.execute(
        "SELECT * FROM onboarding_plans WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],)
    ).fetchall()
    conn.close()
    return jsonify({
        "status": "success",
        "plans": [dict(p) for p in plans]
    })

@app.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    email = get_jwt_identity()
    conn  = get_db()
    user  = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    s     = conn.execute("SELECT * FROM company_settings WHERE user_id = ?", (user["id"],)).fetchone()
    conn.close()
    if s:
        return jsonify({"status": "success", "settings": dict(s)})
    return jsonify({"status": "success", "settings": {}})

@app.route("/settings", methods=["POST"])
@jwt_required()
def save_settings():
    email = get_jwt_identity()
    data  = request.json
    conn  = get_db()
    user  = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.execute("""
        INSERT INTO company_settings
            (user_id, company_name, location, working_hours, working_days, dress_code, tools, documents, training_process)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            company_name=excluded.company_name,
            location=excluded.location,
            working_hours=excluded.working_hours,
            working_days=excluded.working_days,
            dress_code=excluded.dress_code,
            tools=excluded.tools,
            documents=excluded.documents,
            training_process=excluded.training_process,
            updated_at=CURRENT_TIMESTAMP
    """, (
        user["id"],
        data.get("company_name", ""),
        data.get("location", ""),
        data.get("working_hours", ""),
        data.get("working_days", ""),
        data.get("dress_code", ""),
        data.get("tools", ""),
        data.get("documents", ""),
        data.get("training_process", "")
    ))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Settings saved!"})
# ── Health route ──────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ── Agents ────────────────────────────────────────────────────────────────────

def create_agents():
    hr_coordinator = Agent(
        role="HR Coordinator",
        goal="Welcome new employees and collect their basic information",
        backstory="You are a warm and professional HR coordinator. You greet new employees and make them feel welcome.",
        llm="ollama/llama3.1:8b",
        verbose=False
    )
    doc_manager = Agent(
        role="Document Manager",
        goal="Prepare and list all onboarding documents for the new employee",
        backstory="You manage all onboarding paperwork including offer letters, NDAs, and policy documents.",
        llm="ollama/llama3.1:8b",
        verbose=False
    )
    it_agent = Agent(
        role="IT Setup Agent",
        goal="Create IT setup checklist for the new employee",
        backstory="You are the IT onboarding specialist who sets up all tools and accounts.",
        llm="ollama/llama3.1:8b",
        verbose=False
    )
    training_agent = Agent(
        role="Training Coordinator",
        goal="Create a 3-month training plan for the new employee",
        backstory="You design personalized onboarding training schedules for new hires.",
        llm="ollama/llama3.1:8b",
        verbose=False
    )
    return hr_coordinator, doc_manager, it_agent, training_agent

# ── Onboard route ─────────────────────────────────────────────────────────────

@app.route("/onboard", methods=["POST"])
@jwt_required()
def onboard():
    email = get_jwt_identity()
    data  = request.json

    name       = data.get("name", "New Employee")
    role       = data.get("role", "Employee")
    department = data.get("department", "General")
    start_date = data.get("start_date", "TBD")

    result_queue = queue.Queue()

    def run_crew():
        try:
            hr, doc, it, training_agent = create_agents()
            settings         = data.get("settings", {})
            company          = settings.get("company_name", "our company")
            location         = settings.get("location", "")
            hours            = settings.get("working_hours", "")
            days             = settings.get("working_days", "")
            dress            = settings.get("dress_code", "")
            tools            = settings.get("tools", "")
            documents        = settings.get("documents", "")
            training_process = settings.get("training_process", "")

            tasks = [
                Task(
                    description=f"""Welcome {name} joining as {role} in {department} on {start_date}.
                    Company: {company}, Location: {location}
                    Working hours: {hours}, Working days: {days}
                    Dress code: {dress}
                    Write a warm welcome message with day 1 instructions.""",
                    expected_output="A warm welcome message with day 1 instructions.",
                    agent=hr
                ),
                Task(
                    description=f"""List all documents {name} needs for onboarding as {role} at {company}.
                    Required documents: {documents if documents else 'Offer letter, NDA, policy acknowledgments.'}
                    Include deadlines for each. Use the documents exactly as provided.""",
                    expected_output="Complete document checklist with deadlines.",
                    agent=doc
                ),
                Task(
                    description=f"""Create IT setup checklist for {name} as {role} in {department} at {company}.
                    Company tools: {tools if tools else 'Email, communication, project management software.'}
                    List all accounts to create and software to install. Use the tools exactly as provided.""",
                    expected_output="Complete IT setup checklist.",
                    agent=it
                ),
                Task(
                    description=f"""Create a detailed 3-month onboarding training plan for {name} joining as {role} in {department} at {company}.
                    Tools: {tools if tools else 'Standard office tools.'}
                    Documents: {documents if documents else 'Offer letter, NDA, policy acknowledgments.'}
                    Training process: {training_process if training_process else 'Standard onboarding process.'}

                    MONTH 1 — Orientation & Setup:
                    - Week 1: Orientation, meet team, set up all tools
                    - Week 2: Complete all documents, shadow team members
                    - Week 3-4: Begin role-specific training for {role}

                    MONTH 2 — Learning & Growing:
                    - Focus on core responsibilities of {role}
                    - Work on first tasks with mentor support
                    - Weekly check-ins with manager

                    MONTH 3 — Full Productivity:
                    - Take full ownership of {role} responsibilities
                    - Present first deliverable to {department} team
                    - Set 6-month goals with manager""",
                    expected_output="A detailed 3-month training plan.",
                    agent=training_agent
                ),
            ]

            crew   = Crew(agents=[hr, doc, it, training_agent], tasks=tasks, verbose=False)
            output = crew.kickoff()
            result_queue.put({"success": True, "result": str(output)})
        except Exception as e:
            result_queue.put({"success": False, "error": str(e)})

    thread = threading.Thread(target=run_crew)
    thread.start()
    thread.join()

    result = result_queue.get()

    if result["success"]:
        # Save to database
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        conn.execute(
            "INSERT INTO onboarding_plans (user_id, employee_name, role, department, start_date, plan) VALUES (?, ?, ?, ?, ?, ?)",
            (user["id"], name, role, department, start_date, result["result"])
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "result": result["result"]})
    else:
        return jsonify({"status": "error", "message": result["error"]}), 500

if __name__ == "__main__":
    print("HR Onboarding Agent backend running on http://localhost:5000/health")
    app.run(debug=True, port=5000)