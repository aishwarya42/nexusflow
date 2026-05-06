import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

const AGENTS = [
  { icon: "👋", name: "HR Coordinator", task: "Writing welcome message..." },
  { icon: "📄", name: "Doc Manager",    task: "Preparing documents..."     },
  { icon: "💻", name: "IT Setup",       task: "Building IT checklist..."   },
  { icon: "🎓", name: "Training",       task: "Creating 90-day plan..."    },
];

const DEPARTMENTS = [
  "Engineering","Product","Design","Marketing",
  "Sales","Finance","HR","Operations","Legal","Customer Success",
];

const RESULT_LABELS = [
  "Welcome Message",
  "Document Checklist",
  "IT Setup Checklist",
  "30-60-90 Day Training Plan",
];

const DEFAULT_SETTINGS = {
  company_name:"", location:"", working_hours:"",
  working_days:"", dress_code:"", tools:"",
  documents:"", training_process:"",
};

export default function App() {
  const [token, setToken]                 = useState(() => localStorage.getItem("token") || "");
  const [authMode, setAuthMode]           = useState("login");
  const [authForm, setAuthForm]           = useState({ email:"", password:"" });
  const [authError, setAuthError]         = useState("");
  const [tab, setTab]                     = useState("onboard");
  const [form, setForm]                   = useState({ name:"", role:"", department:"", start_date:"", email:"" });
  const [settings, setSettings]           = useState(DEFAULT_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [progress, setProgress]           = useState(0);
  const [activeAgent, setActiveAgent]     = useState(-1);
  const [doneAgents, setDoneAgents]       = useState([]);
  const [statusMsg, setStatusMsg]         = useState("Fill in employee details and click Start Onboarding");
  const [results, setResults]             = useState([]);
  const [error, setError]                 = useState("");
  const [fullText, setFullText]           = useState("");
  const [employeeName, setEmployeeName]   = useState("");
  const [history, setHistory]             = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const timerRef = useRef(null);

  const update         = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateSettings = (k, v) => setSettings(s => ({ ...s, [k]: v }));
  const updateAuth     = (k, v) => setAuthForm(f => ({ ...f, [k]: v }));

  const authHeaders = () => {
    const t = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${t}` } };
  };

  // ── Load settings ─────────────────────────────────────────────────────────

  const loadSettings = async () => {
    try {
      const { data } = await axios.get(`${API}/settings`, authHeaders());
      if (data.status === "success" && Object.keys(data.settings).length > 0) {
        const s = data.settings;
        setSettings({
          company_name:     s.company_name     || "",
          location:         s.location         || "",
          working_hours:    s.working_hours     || "",
          working_days:     s.working_days      || "",
          dress_code:       s.dress_code        || "",
          tools:            s.tools             || "",
          documents:        s.documents         || "",
          training_process: s.training_process  || "",
        });
      }
    } catch (err) {
      console.error("Could not load settings", err);
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleAuth = async () => {
    setAuthError("");
    try {
      const url = authMode === "login" ? `${API}/login` : `${API}/register`;
      const { data } = await axios.post(url, authForm);
      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        await loadSettings();
      } else {
        setAuthError(data.message);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setResults([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
  };

  // ── History ───────────────────────────────────────────────────────────────

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await axios.get(`${API}/history`, authHeaders());
      setHistory(data.plans);
    } catch (err) {
      console.error(err);
    }
    setHistoryLoading(false);
  };

  const openHistory = () => {
    setTab("history");
    loadHistory();
  };

  // ── Save settings ─────────────────────────────────────────────────────────

  const saveSettings = async () => {
    try {
      await axios.post(`${API}/settings`, settings, authHeaders());
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Could not save settings", err);
    }
  };

  // ── Onboard ───────────────────────────────────────────────────────────────

  const startOnboarding = async () => {
    const { name, role, department, start_date } = form;
    if (!name || !role || !department || !start_date) {
      alert("Please fill in all employee fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setProgress(5);
    setActiveAgent(-1);
    setDoneAgents([]);
    setEmployeeName(name);

    const steps = [
      { pct:15, agent:0 }, { pct:35, agent:1 },
      { pct:55, agent:2 }, { pct:75, agent:3 },
    ];

    let step = 0;
    timerRef.current = setInterval(() => {
      if (step < steps.length) {
        const s = steps[step];
        if (step > 0) setDoneAgents(d => [...d, step - 1]);
        setActiveAgent(s.agent);
        setProgress(s.pct);
        setStatusMsg(AGENTS[s.agent].task);
        step++;
      }
    }, 15000);

    try {
      const formatted = new Date(start_date).toLocaleDateString("en-US", {
        year:"numeric", month:"long", day:"numeric",
      });
      const { data } = await axios.post(`${API}/onboard`, {
        name, role, department, start_date: formatted,
        email: form.email, settings,
      }, authHeaders());

      clearInterval(timerRef.current);
      setActiveAgent(-1);
      setDoneAgents([0,1,2,3]);
      setProgress(100);
      setStatusMsg("Onboarding plan ready!");

      if (data.status === "success") {
        setFullText(data.result);
        splitResults(data.result);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      clearInterval(timerRef.current);
      setError("Cannot connect to backend. Make sure backend.py is running.");
      setProgress(0);
      setActiveAgent(-1);
      setDoneAgents([]);
      setStatusMsg("Connection failed.");
    }
    setLoading(false);
  };

  const splitResults = (text) => {
    const paras = text.split(/\n\n+/).filter(Boolean);
    const q = Math.ceil(paras.length / 4);
    setResults([
      paras.slice(0, q).join("\n\n"),
      paras.slice(q, q*2).join("\n\n"),
      paras.slice(q*2, q*3).join("\n\n"),
      paras.slice(q*3).join("\n\n"),
    ]);
  };

  const download = () => {
    const blob = new Blob(
      [`HR ONBOARDING PLAN — ${employeeName}\n${"=".repeat(50)}\n\n${fullText}`],
      { type:"text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `onboarding-${employeeName.replace(/\s+/g,"-").toLowerCase()}.txt`;
    a.click();
  };

  // ── Login / Register screen ───────────────────────────────────────────────

  if (!token) return (
    <div className="app">
      <div className="grain" />
      <header>
        <span className="badge">AI-Powered</span>
        <h1>HR Onboarding<br /><em>Agent</em></h1>
        <p>Sign in to start onboarding your team</p>
      </header>

      <div className="card" style={{ maxWidth:420, margin:"0 auto" }}>
        <div className="card-title">{authMode === "login" ? "Sign In" : "Create Account"}</div>

        {authError && <div className="error-msg" style={{ marginBottom:16 }}>{authError}</div>}

        <div className="field" style={{ marginBottom:16 }}>
          <label>Email</label>
          <input type="email" value={authForm.email}
            onChange={e => updateAuth("email", e.target.value)}
            placeholder="you@company.com" />
        </div>
        <div className="field" style={{ marginBottom:24 }}>
          <label>Password</label>
          <input type="password" value={authForm.password}
            onChange={e => updateAuth("password", e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleAuth()} />
        </div>

        <button className="btn" onClick={handleAuth}>
          {authMode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"var(--muted)" }}>
          {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color:"var(--accent)", cursor:"pointer" }}
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>
            {authMode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );

  // ── Main app ──────────────────────────────────────────────────────────────

  return (
    <div className="app">
      <div className="grain" />

      <header>
        <span className="badge">AI-Powered</span>
        <h1>HR Onboarding<br /><em>Agent</em></h1>
        <p>Four AI agents work together to onboard your new hire instantly</p>
        <button className="btn-outline" onClick={logout}
          style={{ marginTop:12, padding:"8px 20px", fontSize:13 }}>
          Sign Out
        </button>
      </header>

      <div className="tabs">
        <button className={`tab ${tab==="onboard" ? "active":""}`} onClick={() => setTab("onboard")}>
          👤 Onboard
        </button>
        <button className={`tab ${tab==="history" ? "active":""}`} onClick={openHistory}>
          📋 History
        </button>
        <button className={`tab ${tab==="settings" ? "active":""}`} onClick={() => setTab("settings")}>
          ⚙️ Settings
        </button>
      </div>

      {/* ── ONBOARD TAB ── */}
      {tab === "onboard" && <>
        <div className="card">
          <div className="card-title">New Employee Details</div>
          <div className="grid">
            <div className="field">
              <label>Full Name</label>
              <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Priya Sharma" />
            </div>
            <div className="field">
              <label>Job Title</label>
              <input value={form.role} onChange={e => update("role", e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="field">
              <label>Department</label>
              <select value={form.department} onChange={e => update("department", e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => update("start_date", e.target.value)} />
            </div>
            <div className="field">
              <label>Employee Email (optional)</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="e.g. priya@company.com" />
            </div>
          </div>
          <button className="btn" onClick={startOnboarding} disabled={loading}>
            {loading ? <><span className="spinner" /> Running agents...</> : "Start Onboarding"}
          </button>
        </div>

        <div className="card">
          <div className="card-title">Agent Status</div>
          <div className={`loading-bar ${loading || progress > 0 ? "visible":""}`}>
            <div className="loading-fill" style={{ width:`${progress}%` }} />
          </div>
          <div className={`status-text ${loading ? "active":""}`}>{statusMsg}</div>
          <div className="agents">
            {AGENTS.map((a, i) => (
              <div key={i} className={`agent-card ${activeAgent===i ? "active":""} ${doneAgents.includes(i) ? "done":""}`}>
                <div className="pulse-ring" />
                <span className="agent-icon">{a.icon}</span>
                <div className="agent-name">{a.name}</div>
                <div className="agent-status">
                  {doneAgents.includes(i) ? "Done ✓" : activeAgent===i ? "Working..." : "Waiting"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="results-header">
            <div className="card-title" style={{ margin:0 }}>Onboarding Plan</div>
            {results.length > 0 && <button className="btn-outline" onClick={download}>Download</button>}
          </div>
          {error && <div className="error-msg">{error}</div>}
          {results.length === 0 && !error && <div className="empty-state">Results will appear here after onboarding runs</div>}
          {results.map((text, i) => text.trim() && (
            <div key={i} className="result-block">
              <div className="result-label"><div className="dot" />{RESULT_LABELS[i]}</div>
              <div className="result-text">{text}</div>
            </div>
          ))}
        </div>
      </>}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="card">
          <div className="card-title">Onboarding History</div>
          {historyLoading && <div className="empty-state">Loading...</div>}
          {!historyLoading && history.length === 0 && (
            <div className="empty-state">No onboarding plans yet. Start by onboarding an employee!</div>
          )}
          {history.map((plan) => (
            <div key={plan.id} className="result-block">
              <div className="result-label">
                <div className="dot" />
                {plan.employee_name} — {plan.role} — {plan.department}
                <span style={{ marginLeft:"auto", fontSize:11, color:"var(--muted)" }}>
                  {new Date(plan.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="result-text" style={{ maxHeight:200, overflow:"auto" }}>
                {plan.plan.slice(0, 400)}...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && <>
        <div className="card">
          <div className="card-title">Company Information</div>
          <div className="grid">
            <div className="field">
              <label>Company Name</label>
              <input value={settings.company_name} onChange={e => updateSettings("company_name", e.target.value)} placeholder="e.g. TechCorp India" />
            </div>
            <div className="field">
              <label>Office Location</label>
              <input value={settings.location} onChange={e => updateSettings("location", e.target.value)} placeholder="e.g. Bangalore, Karnataka" />
            </div>
            <div className="field">
              <label>Working Hours</label>
              <input value={settings.working_hours} onChange={e => updateSettings("working_hours", e.target.value)} placeholder="e.g. 9:30 AM - 6:30 PM IST" />
            </div>
            <div className="field">
              <label>Working Days</label>
              <input value={settings.working_days} onChange={e => updateSettings("working_days", e.target.value)} placeholder="e.g. Monday to Friday" />
            </div>
            <div className="field">
              <label>Dress Code</label>
              <input value={settings.dress_code} onChange={e => updateSettings("dress_code", e.target.value)} placeholder="e.g. Business casual" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Tools & Software</div>
          <div className="field">
            <label>Company Tools (one per line)</label>
            <textarea value={settings.tools} onChange={e => updateSettings("tools", e.target.value)}
              placeholder={"Slack - Communication\nJira - Project management\nGitHub - Code\nGoogle Workspace - Email & Docs"} rows={6} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Required Documents</div>
          <div className="field">
            <label>Onboarding Documents (one per line)</label>
            <textarea value={settings.documents} onChange={e => updateSettings("documents", e.target.value)}
              placeholder={"Offer letter - Day 1\nNDA agreement - Day 1\nPF form - Week 1\nBank details - Day 1"} rows={6} />
          </div>
        </div>

        <div className="card">
          <div className="card-title">Training Process</div>
          <div className="field">
            <label>Describe your onboarding process (AI builds 3-month plan around this)</label>
            <textarea value={settings.training_process} onChange={e => updateSettings("training_process", e.target.value)}
              placeholder={"Week 1: Orientation and tool setup\nWeek 2: Department training\nMonth 1: Complete mandatory modules\nMonth 2: First project with mentor\nMonth 3: Full productivity"} rows={6} />
          </div>
        </div>

        <button className="btn" onClick={saveSettings}>
          {settingsSaved ? "✅ Settings Saved!" : "Save Company Settings"}
        </button>
      </>}

    </div>
  );
}