# **Gandiva AI**

### Product Vision

An AI-powered career acceleration platform that helps students become placement-ready through:

* Resume creation
* Resume analysis
* Quiz generation
* Mock interviews
* Skill gap detection
* Internship discovery
* Personalized roadmaps

This is essentially **LeetCode + LinkedIn Jobs + Resume Builder + AI Career Mentor** in one platform.

Similar AI hiring/career products already use resume screening, skill intelligence, and AI coaching, which validates market demand. ([Klimb][1])

---

# 1. Full Feature Architecture

## Core Modules

```txt
1. Authentication Module
2. Student Profile Module
3. Resume Module
4. AI Resume Analyzer
5. AI Quiz Generator
6. AI Mock Interview
7. Skill Gap Engine
8. AI Roadmap Generator
9. Internship Aggregator
10. Analytics Dashboard
11. RAG Knowledge Engine
12. Agent Orchestration Layer
```

---

# 2. User Journey

```txt
User Signup
   ↓
Create Profile
   ↓
Upload / Create Resume
   ↓
Resume Analysis
   ↓
Take AI Quiz
   ↓
Mock Interview
   ↓
Skill Gap Detection
   ↓
Roadmap Generation
   ↓
Internship Recommendations
```

The platform continuously updates the user’s career readiness.

---

# 3. Frontend Architecture (React)

Use:

* React
* TypeScript
* Tailwind CSS
* Framer Motion

---

## Frontend Folder Structure

```bash
frontend/
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── resume/
│   │   ├── quiz/
│   │   ├── interview/
│   │   └── roadmap/
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ResumeBuilder.jsx
│   │   ├── ResumeAnalyzer.jsx
│   │   ├── Quiz.jsx
│   │   ├── Interview.jsx
│   │   ├── SkillGap.jsx
│   │   ├── Roadmap.jsx
│   │   └── Internships.jsx
│   │
│   ├── hooks/
│   ├── services/
│   ├── context/
│   └── utils/
```

---

## Frontend Responsibilities

### Dashboard

Shows:

* ATS score
* Placement score
* Quiz stats
* Interview stats
* Weak skills
* Recommended internships

### Resume Builder

Features:

* Live preview
* Drag/drop sections
* AI bullet generation
* Export PDF

### Quiz Interface

Features:

* Timer
* MCQs
* Coding round
* Score display

### Mock Interview Screen

Features:

* Chat UI
* Voice support
* Webcam (optional)

---

# 4. Backend Architecture (FastAPI)

Use:

* FastAPI
* Python
* WebSocket support
* Async endpoints

---

## Backend Responsibilities

FastAPI acts as:

### API Gateway

Routes all requests.

### Business Logic Layer

Handles:

* Auth
* Resume parsing
* AI workflow triggering
* Storage
* Analytics

---

## Backend Folder Structure

```bash
backend/
│
├── api/
├── core/
├── db/
├── models/
├── schemas/
├── services/
├── agents/
├── rag/
├── graph/
└── main.py
```

---

## API Endpoints

### Authentication

```txt
POST /auth/signup
POST /auth/login
```

### Resume

```txt
POST /resume/create
POST /resume/upload
POST /resume/analyze
GET  /resume/{id}
```

### Quiz

```txt
POST /quiz/generate
POST /quiz/submit
GET  /quiz/results
```

### Interview

```txt
POST /interview/start
WS   /interview/live
POST /interview/submit
```

### Skill Gap

```txt
POST /skills/analyze
```

### Roadmap

```txt
POST /roadmap/generate
```

### Jobs

```txt
GET /internships
```

---

# 5. Database Architecture (SQLite)

Use:

* SQLite

SQLite stores structured data.

---

## Tables

### Users

```sql
id
name
email
password_hash
college
branch
cgpa
year
created_at
```

---

### Resumes

```sql
id
user_id
resume_text
ats_score
file_path
created_at
```

---

### Quiz Attempts

```sql
id
user_id
topic
score
weak_topics
created_at
```

---

### Interview Sessions

```sql
id
user_id
role
score
feedback
transcript
created_at
```

---

### Skills

```sql
id
user_id
skill_name
level
```

---

### Roadmaps

```sql
id
user_id
roadmap_json
created_at
```

---

### Internship Cache

```sql
id
company
role
skills_required
stipend
deadline
```

---

# 6. AI Layer Architecture

This is the heart of the platform.

Use:

* LangChain
* LangGraph
* RAG
* LLM APIs

---

# Why LangGraph?

Because this is a **multi-agent workflow system**.

Example query:

> Analyze resume and create roadmap for Google internship.

That requires:

1. Resume agent
2. Skill gap agent
3. RAG retrieval
4. Roadmap agent

That’s a graph workflow.

---

# 7. Agent Architecture

## Router Agent

Decides which agents to call.

Input:

```txt
User Request
```

Output:

```txt
Required Agents
```

---

## Resume Agent

Responsibilities:

* Parse PDF
* Extract skills
* ATS analysis
* Resume scoring

Input:

* Resume
* Target role

Output:

```json
{
  "ats_score": 85,
  "missing_keywords": ["Docker", "AWS"]
}
```

---

## Quiz Agent

Responsibilities:

* Generate questions
* Evaluate answers
* Detect weak topics

Input:

* Topic
* Difficulty

Output:

```json
{
 "score": 72,
 "weak_topics": ["OS", "DBMS"]
}
```

---

## Mock Interview Agent

Responsibilities:

* Ask adaptive questions
* Maintain conversation memory
* Score responses

Evaluates:

* Technical accuracy
* Communication
* Confidence

---

## Skill Gap Agent

Compares:

```txt
Current Skills
vs
Target Role Skills
```

Example:
Frontend role requires:

* JS
* React
* State management
* APIs
* Testing

Student has:

* JS
* React

Gap:

* Testing
* APIs
* State management

---

## Roadmap Agent

Input:

* Weak skills
* Available hours/day
* Deadline

Output:
12-week plan.

---

## Internship Agent

Responsibilities:

* Fetch internships
* Rank by relevance
* Match user profile

---

# 8. LangGraph Workflow

```txt
                   User Request
                        |
                  Router Agent
                        |
        ---------------------------------
        |         |         |           |
        v         v         v           v
    Resume     Quiz    Interview    Skill Gap
      Agent     Agent     Agent       Agent
        \          |         |          /
         \_________|_________|_________/
                        |
                    RAG Layer
                        |
                  Roadmap Agent
                        |
                     Response
```

This is your flagship architecture.

---

# 9. RAG Architecture

Use RAG for knowledge-heavy tasks.

---

## Knowledge Sources

### Resume Dataset

* Strong resumes
* ATS templates

### Interview Dataset

* Company interview questions
* Experiences

### Jobs Dataset

* Internship descriptions
* Role requirements

### Learning Dataset

* Courses
* Notes
* PDFs

Academic and production systems show RAG works well for multilingual career guidance and job recommendation. ([arXiv][2])

---

## RAG Pipeline

```txt
Documents
   ↓
Chunking
   ↓
Embeddings
   ↓
Vector Store
   ↓
Retriever
   ↓
Prompt Augmentation
   ↓
LLM
```

---

# 10. Vector DB Architecture

Use:

* Chroma

Collections:

```txt
resume_templates
interview_questions
internship_jobs
company_patterns
learning_resources
```

Document Example:

```json
{
 "content": "Google asks graph problems...",
 "metadata": {
   "company": "Google",
   "role": "SDE Intern"
 }
}
```

---

# 11. LLM Layer

Possible providers:

* [OpenAI Platform](https://platform.openai.com/?utm_source=chatgpt.com)
* [Google AI Studio](https://aistudio.google.com/?utm_source=chatgpt.com)
* [Groq](https://groq.com/?utm_source=chatgpt.com)

Recommended model strategy:

### Cheap/Fast Model

Use for:

* Quiz generation
* Resume bullet rewrite
* Summaries

### Strong Reasoning Model

Use for:

* Skill gap analysis
* Roadmaps
* Interview evaluation

---

# 12. End-to-End Feature Flows

---

## Resume Analyzer Flow

```txt
Upload PDF
   ↓
FastAPI
   ↓
Resume Parser
   ↓
Resume Agent
   ↓
RAG (best resumes)
   ↓
LLM Scoring
   ↓
SQLite Save
   ↓
Dashboard
```

---

## Quiz Flow

```txt
Select Topic
   ↓
Quiz Agent
   ↓
Generate Questions
   ↓
User Answers
   ↓
Evaluation
   ↓
Weak Skill Update
```

---

## Mock Interview Flow

```txt
Select Role
   ↓
Interview Agent
   ↓
Live Chat / Voice
   ↓
Answer Evaluation
   ↓
Score + Feedback
```

---

## Skill Gap Flow

```txt
Resume
+ Quiz Scores
+ Interview Score
+ Goal Role
      ↓
Skill Gap Agent
      ↓
Missing Skills
```

---

## Roadmap Flow

```txt
Skill Gaps
+ Deadline
+ Daily Hours
     ↓
Roadmap Agent
     ↓
Personal Plan
```

---

# 13. Placement Score Engine

A weighted scoring system:

```txt
Placement Score =
30% Resume
25% Quiz
20% Interview
15% Projects
10% Skill Match
```

Output:

```txt
Placement Score: 81/100
```

This becomes a strong dashboard metric.

---

# 14. Deployment Architecture

Frontend:

* [Vercel](https://vercel.com?utm_source=chatgpt.com)

Backend:

* [Render](https://render.com?utm_source=chatgpt.com) or [Railway](https://railway.com?utm_source=chatgpt.com)

AI:

* Cloud APIs

Storage:

* Local / cloud object storage