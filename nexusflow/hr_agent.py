from crewai import Agent, Task, Crew

# ── Agents ───────────────────────────────────────────────────────────────────

hr_coordinator = Agent(
    role="HR Coordinator",
    goal="Welcome new employees and collect their basic information",
    backstory="You are a warm and professional HR coordinator. You greet new employees and make them feel welcome.",
    llm="ollama/llama3.1:8b",
    verbose=True
)

doc_manager = Agent(
    role="Document Manager",
    goal="Prepare all onboarding documents for the new employee",
    backstory="You manage all onboarding paperwork including offer letters, NDAs, and policy documents.",
    llm="ollama/llama3.1:8b",
    verbose=True
)

it_agent = Agent(
    role="IT Setup Agent",
    goal="Create IT setup checklist for the new employee",
    backstory="You are the IT onboarding specialist who sets up all tools and accounts.",
    llm="ollama/llama3.1:8b",
    verbose=True
)

training_agent = Agent(
    role="Training Coordinator",
    goal="Create a 30-60-90 day training plan for the new employee",
    backstory="You design personalized onboarding training schedules for new hires.",
    llm="ollama/llama3.1:8b",
    verbose=True
)

# ── Tasks ────────────────────────────────────────────────────────────────────

def create_onboarding_tasks(employee_name, role, department, start_date):

    welcome_task = Task(
        description=f"Welcome {employee_name} joining as {role} in {department} on {start_date}. Write a warm welcome message with day 1 instructions.",
        expected_output="A warm welcome message with day 1 instructions",
        agent=hr_coordinator
    )

    document_task = Task(
        description=f"List all documents {employee_name} needs to sign and read for onboarding as {role}. Include deadlines.",
        expected_output="Complete document checklist with deadlines",
        agent=doc_manager
    )

    it_task = Task(
        description=f"Create IT setup checklist for {employee_name} as {role} in {department}. List all software, accounts and access needed.",
        expected_output="Complete IT setup checklist",
        agent=it_agent
    )

    training_task = Task(
        description=f"Create a 30-60-90 day training plan for {employee_name} as {role} in {department}.",
        expected_output="Detailed 30-60-90 day onboarding plan",
        agent=training_agent
    )

    return [welcome_task, document_task, it_task, training_task]

# ── Run ───────────────────────────────────────────────────────────────────────

def run_onboarding(employee_name, role, department, start_date):
    print(f"\n{'='*60}")
    print(f"  Starting HR Onboarding for {employee_name}")
    print(f"{'='*60}\n")

    tasks = create_onboarding_tasks(employee_name, role, department, start_date)

    crew = Crew(
        agents=[hr_coordinator, doc_manager, it_agent, training_agent],
        tasks=tasks,
        verbose=True
    )

    result = crew.kickoff()
    return result

# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    result = run_onboarding(
        employee_name = "Priya Sharma",
        role          = "Software Engineer",
        department    = "Engineering",
        start_date    = "May 10, 2026"
    )

    print("\n" + "="*60)
    print("  ONBOARDING PLAN COMPLETE")
    print("="*60)
    print(result)