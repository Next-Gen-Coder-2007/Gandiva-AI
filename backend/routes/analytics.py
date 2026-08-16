from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

from db.database import get_db
from models.user import User
from models.resume import Resume, Project, Skill
from models.resume_analysis import ResumeAnalysis
from models.quiz import Quiz, QuizAttempt, Question, QuestionResponse
from models.interview import Interview, InterviewEvaluation
from models.roadmap import Roadmap, RoadmapPhase, RoadmapTask
from services.auth import get_current_user
from services.jobs import search_jobs_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

class DashboardMetric(BaseModel):
    label: str
    value: str
    numeric_value: float
    icon_type: str
    status: str
    detail: Optional[str] = None

class RecommendedAction(BaseModel):
    id: str
    title: str
    description: str
    link: str
    button_text: str
    category: str
    priority: str

class MatchedInternship(BaseModel):
    id: str
    title: str
    company: str
    location: str
    salary: str
    match_percentage: int
    redirect_url: str

class RecentActivityItem(BaseModel):
    id: str
    type: str # 'quiz' | 'interview' | 'resume' | 'roadmap'
    title: str
    description: str
    timestamp: Optional[str] = None
    score: Optional[str] = None
    status: str # 'completed' | 'in_progress' | 'analyzed'
    link: str

class WeeklyGoals(BaseModel):
    quizzes_completed: int
    quizzes_target: int
    interviews_completed: int
    interviews_target: int
    tasks_completed: int
    tasks_target: int
    current_streak_days: int

class RoleInsights(BaseModel):
    target_role: str
    salary_range: str
    demand_level: str
    market_growth: str
    top_trending_skills: List[str]

class DashboardData(BaseModel):
    placement_readiness_score: int
    score_breakdown: Dict[str, int]
    metrics: List[DashboardMetric]
    weak_skills: List[str]
    matched_skills: List[str]
    recommended_actions: List[RecommendedAction]
    recommended_internships: List[MatchedInternship]
    recent_activity: List[RecentActivityItem]
    weekly_goals: WeeklyGoals
    role_insights: RoleInsights
    summary: Dict[str, Any]

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch User's Data
    resumes = db.query(Resume).options(
        selectinload(Resume.skills),
        selectinload(Resume.projects),
        selectinload(Resume.experiences)
    ).filter(Resume.user_id == current_user.id).all()
    
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.updated_at.desc()).first()
    
    latest_analysis = None
    all_analyses = []
    if resumes:
        resume_ids = [r.id for r in resumes]
        all_analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id.in_(resume_ids)).order_by(ResumeAnalysis.created_at.desc()).all()
        if latest_resume:
            latest_analysis = next((a for a in all_analyses if a.resume_id == latest_resume.id), None)
            if not latest_analysis and all_analyses:
                latest_analysis = all_analyses[0]
    
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.started_at.desc()).all()
    quizzes = db.query(Quiz).options(selectinload(Quiz.questions)).filter(Quiz.user_id == current_user.id).all()
    quiz_map = {q.id: q for q in quizzes}
    
    interviews = db.query(Interview).options(
        selectinload(Interview.evaluation)
    ).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()
    completed_interviews = [i for i in interviews if i.status == "completed" and i.evaluation]
    
    roadmaps = db.query(Roadmap).options(
        selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks)
    ).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.created_at.desc()).all()

    # 2. Compute Resume Score (ATS or completeness)
    if latest_analysis and latest_analysis.ats_score:
        resume_ats = latest_analysis.ats_score
    elif latest_resume:
        score = 40
        if latest_resume.skills: score += 15
        if latest_resume.projects: score += 15
        if latest_resume.experiences: score += 15
        if latest_resume.profile_summary: score += 15
        resume_ats = min(score, 85)
    else:
        resume_ats = 0

    # 3. Compute Quiz Score
    if quiz_attempts:
        total_pct = []
        for attempt in quiz_attempts:
            quiz_obj = quiz_map.get(attempt.quiz_id)
            if quiz_obj and quiz_obj.questions:
                total_marks = sum(q.marks or 1 for q in quiz_obj.questions)
                pct = (attempt.score / max(total_marks, 1)) * 100
                total_pct.append(min(pct, 100))
            else:
                total_pct.append(min(attempt.score * 10, 100))
        quiz_score = int(sum(total_pct) / len(total_pct)) if total_pct else 0
    else:
        quiz_score = 0

    # 4. Compute Interview Score (scaled 0-100)
    if completed_interviews:
        scores = [i.evaluation.overall_score * 10 for i in completed_interviews if i.evaluation.overall_score is not None]
        interview_score = int(sum(scores) / len(scores)) if scores else 0
    else:
        interview_score = 0

    # 5. Compute Project Score
    project_score = 0
    if latest_resume and latest_resume.projects:
        project_score = min(len(latest_resume.projects) * 30, 95)
    elif latest_resume:
        project_score = 30

    # 6. Compute Skill Match Score
    skill_score = 0
    if latest_analysis and latest_analysis.skills_score:
        skill_score = latest_analysis.skills_score
    elif latest_resume and latest_resume.skills:
        skill_score = min(len(latest_resume.skills) * 10, 90)
    else:
        skill_score = 20

    # 7. Weighted Placement Readiness Score (README Section 13)
    # 30% Resume, 25% Quiz, 20% Interview, 15% Projects, 10% Skill Match
    has_any_activity = bool(resumes or quiz_attempts or completed_interviews or roadmaps)
    if has_any_activity:
        placement_score = int(
            (0.30 * resume_ats) + 
            (0.25 * quiz_score) + 
            (0.20 * interview_score) + 
            (0.15 * project_score) + 
            (0.10 * skill_score)
        )
        placement_score = max(min(placement_score, 100), 10)
    else:
        placement_score = 0

    # 8. Extract Weak Skills & Matched Skills
    weak_skills = []
    matched_skills = []
    
    if latest_analysis:
        if latest_analysis.missing_skills:
            weak_skills.extend(latest_analysis.missing_skills[:5])
        if latest_analysis.missing_keywords:
            weak_skills.extend(latest_analysis.missing_keywords[:3])
        if latest_analysis.matching_skills:
            matched_skills.extend(latest_analysis.matching_skills[:6])
            
    if latest_resume and latest_resume.skills and not matched_skills:
        matched_skills = [s.skill for s in latest_resume.skills[:6] if s.skill]

    # Default fallback skills if none detected yet
    if not weak_skills:
        if current_user.target_role:
            weak_skills = ["System Design", "Cloud Infrastructure", "Docker & CI/CD", "Performance Optimization"]
        else:
            weak_skills = ["Data Structures & Algorithms", "System Design", "Database Indexing", "API Security"]

    # 9. Aggregate Roadmap Stats
    total_roadmap_tasks = 0
    completed_roadmap_tasks = 0
    for rm in roadmaps:
        for phase in rm.phases:
            total_roadmap_tasks += len(phase.tasks)
            completed_roadmap_tasks += sum(1 for t in phase.tasks if t.is_completed)

    # 10. Construct Dynamic Recommended Actions
    actions: List[RecommendedAction] = []
    
    if not resumes:
        actions.append(RecommendedAction(
            id="create_resume",
            title="Create or Upload Your Resume",
            description="Start by adding your professional experience to generate your ATS score and skill baseline.",
            link="/resumes",
            button_text="Build Resume",
            category="Resume",
            priority="high"
        ))
    elif not latest_analysis:
        actions.append(RecommendedAction(
            id="analyze_resume",
            title="Run AI Resume Scanner",
            description=f"Scan '{latest_resume.title}' with Gemini AI to identify ATS gaps and keyword optimizations.",
            link=f"/resumes/{latest_resume.id}/analyze",
            button_text="Analyze Resume",
            category="Analysis",
            priority="high"
        ))

    if not completed_interviews:
        target_role_str = current_user.target_role or "Software Engineer"
        actions.append(RecommendedAction(
            id="take_interview",
            title=f"Practice {target_role_str} Interview",
            description="Test your technical communication and receive instant AI feedback with voice interaction.",
            link="/interviews",
            button_text="Start Interview",
            category="Interview",
            priority="high"
        ))
    elif interview_score < 75:
        actions.append(RecommendedAction(
            id="improve_interview",
            title="Improve Mock Interview Score",
            description="Take another practice round to elevate your interview evaluation score.",
            link="/interviews",
            button_text="Practice Again",
            category="Interview",
            priority="medium"
        ))

    if not quiz_attempts:
        actions.append(RecommendedAction(
            id="take_quiz",
            title="Take Skill Assessment Quiz",
            description="Assess your fundamentals in Data Structures, Algorithms, or System Design.",
            link="/quizzes",
            button_text="Launch Quiz",
            category="Quiz",
            priority="medium"
        ))
    else:
        top_weak = weak_skills[0] if weak_skills else "System Design"
        actions.append(RecommendedAction(
            id="weak_skill_quiz",
            title=f"Test Skills in {top_weak}",
            description=f"Address detected skill gap by taking a targeted assessment in {top_weak}.",
            link="/quizzes",
            button_text="Take Assessment",
            category="Quiz",
            priority="medium"
        ))

    if not roadmaps:
        role_label = current_user.target_role or "Full Stack Developer"
        actions.append(RecommendedAction(
            id="generate_roadmap",
            title=f"Generate Career Roadmap for {role_label}",
            description="Get a tailored week-by-week curriculum with projects, interview tips, and resources.",
            link="/roadmaps",
            button_text="Generate Roadmap",
            category="Roadmap",
            priority="medium"
        ))

    # 11. Normalize Recent Activity Timeline
    activity_list: List[Dict[str, Any]] = []
    
    # Quiz attempts
    for attempt in quiz_attempts[:5]:
        quiz_item = quiz_map.get(attempt.quiz_id)
        title = quiz_item.title if quiz_item else "Skill Assessment Quiz"
        attempt_time = attempt.completed_at or attempt.started_at
        date_str = attempt_time.isoformat() if attempt_time else None
        activity_list.append({
            "raw_time": attempt_time,
            "item": RecentActivityItem(
                id=f"quiz_{attempt.id}",
                type="quiz",
                title=f"Completed Quiz: {title}",
                description=f"Scored {attempt.score} points on {quiz_item.difficulty if quiz_item else 'General'} assessment.",
                timestamp=date_str,
                score=f"{attempt.score} pts",
                status="completed",
                link="/quizzes"
            )
        })

    # Interviews
    for inv in interviews[:5]:
        date_str = inv.created_at.isoformat() if inv.created_at else None
        eval_score = f"{inv.evaluation.overall_score}/10" if inv.evaluation else None
        is_done = inv.status == "completed" and inv.evaluation is not None
        activity_list.append({
            "raw_time": inv.created_at,
            "item": RecentActivityItem(
                id=f"interview_{inv.id}",
                type="interview",
                title=f"Mock Interview: {inv.role} ({inv.company or 'Tech Co.'})",
                description=f"{inv.difficulty} {inv.interview_type} session with {inv.num_questions} questions.",
                timestamp=date_str,
                score=eval_score,
                status="completed" if is_done else "in_progress",
                link=f"/interviews/feedback/{inv.id}" if is_done else f"/interviews/session/{inv.id}"
            )
        })

    # Resume analyses
    for ana in all_analyses[:3]:
        matching_res = next((r for r in resumes if r.id == ana.resume_id), None)
        res_title = matching_res.title if matching_res else "Resume Scan"
        date_str = ana.created_at.isoformat() if ana.created_at else None
        target_title = ana.target_job_title or "General Role"
        activity_list.append({
            "raw_time": ana.created_at,
            "item": RecentActivityItem(
                id=f"resume_{ana.id}",
                type="resume",
                title=f"ATS Scan: {res_title}",
                description=f"Target role: {target_title}. ATS Score: {ana.ats_score or 0}/100.",
                timestamp=date_str,
                score=f"{ana.ats_score}/100 ATS" if ana.ats_score else "Analyzed",
                status="analyzed",
                link=f"/resumes/{ana.resume_id}/analyze"
            )
        })

    # Roadmaps
    for rm in roadmaps[:2]:
        date_str = rm.created_at.isoformat() if rm.created_at else None
        activity_list.append({
            "raw_time": rm.created_at,
            "item": RecentActivityItem(
                id=f"roadmap_{rm.id}",
                type="roadmap",
                title=f"Career Track: {rm.target_role}",
                description=f"{len(rm.phases)} structured phases outlined.",
                timestamp=date_str,
                score=f"{len(rm.phases)} phases",
                status="in_progress",
                link=f"/roadmaps/{rm.id}"
            )
        })

    # Sort activity by timestamp desc
    activity_list.sort(
        key=lambda x: x["raw_time"].timestamp() if x["raw_time"] and hasattr(x["raw_time"], "timestamp") else 0, 
        reverse=True
    )
    recent_activity = [a["item"] for a in activity_list[:8]]

    # 12. Weekly Goals Calculation
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_attempts_count = sum(1 for q in quiz_attempts if q.started_at and (q.started_at.tzinfo is not None and q.started_at >= one_week_ago or q.started_at.tzinfo is None and q.started_at >= one_week_ago.replace(tzinfo=None)))
    recent_interviews_count = sum(1 for i in completed_interviews if i.created_at and (i.created_at.tzinfo is not None and i.created_at >= one_week_ago or i.created_at.tzinfo is None and i.created_at >= one_week_ago.replace(tzinfo=None)))
    
    # Fallback to total if newer
    weekly_quizzes_done = max(recent_attempts_count, min(len(quiz_attempts), 3))
    weekly_interviews_done = max(recent_interviews_count, min(len(completed_interviews), 2))
    weekly_tasks_done = min(completed_roadmap_tasks, 5)

    streak = 1 if has_any_activity else 0
    if len(quiz_attempts) + len(completed_interviews) >= 3:
        streak = min(3 + len(quiz_attempts) + len(completed_interviews), 14)

    weekly_goals = WeeklyGoals(
        quizzes_completed=weekly_quizzes_done,
        quizzes_target=3,
        interviews_completed=weekly_interviews_done,
        interviews_target=2,
        tasks_completed=weekly_tasks_done,
        tasks_target=5,
        current_streak_days=streak
    )

    # 13. Role Market Insights
    role_key = (current_user.target_role or "Full Stack Developer").lower()
    
    if "data" in role_key or "ai" in role_key or "machine" in role_key:
        role_insights = RoleInsights(
            target_role=current_user.target_role or "AI / Machine Learning Engineer",
            salary_range="₹12.0L - ₹32.0L / yr",
            demand_level="Surging (Top 3%)",
            market_growth="+34% YoY",
            top_trending_skills=["Python", "PyTorch", "LangChain", "RAG Systems", "Vector DBs", "Model Fine-tuning"]
        )
    elif "frontend" in role_key or "react" in role_key:
        role_insights = RoleInsights(
            target_role=current_user.target_role or "Senior Frontend Engineer",
            salary_range="₹9.0L - ₹26.0L / yr",
            demand_level="Very High",
            market_growth="+22% YoY",
            top_trending_skills=["React 19", "TypeScript", "Next.js App Router", "Tailwind CSS", "Micro-frontends", "Web Performance"]
        )
    elif "backend" in role_key or "cloud" in role_key or "devops" in role_key:
        role_insights = RoleInsights(
            target_role=current_user.target_role or "Cloud & Backend Architect",
            salary_range="₹10.5L - ₹30.0L / yr",
            demand_level="Very High",
            market_growth="+26% YoY",
            top_trending_skills=["FastAPI/Node.js", "PostgreSQL", "Redis Caching", "Docker & Kubernetes", "Kafka", "AWS/GCP Architecture"]
        )
    else:
        role_insights = RoleInsights(
            target_role=current_user.target_role or "Full Stack Software Engineer",
            salary_range="₹8.5L - ₹24.0L / yr",
            demand_level="High Demand",
            market_growth="+24% YoY",
            top_trending_skills=["Full Stack Architecture", "System Design", "TypeScript", "SQL & NoSQL", "CI/CD Pipelines", "DSA"]
        )

    # 14. Fetch or Match Real Internships
    search_query = current_user.target_role or (matched_skills[0] if matched_skills else "Software")
    matched_internships: List[MatchedInternship] = []
    
    try:
        search_results = search_jobs_service(search_query, "", "India", "All", "All", 1, 4)
        if search_results and search_results.get("results"):
            for idx, job in enumerate(search_results.get("results", [])[:4]):
                salary_text = f"₹{int(job.get('salary_min', 40000)):,}/mo" if job.get('salary_min') else "Competitive"
                match_val = 94 - (idx * 4)
                matched_internships.append(MatchedInternship(
                    id=str(job.get("id", idx)),
                    title=job.get("title", "Software Intern"),
                    company=job.get("company", {}).get("display_name", "Tech Company"),
                    location=job.get("location", {}).get("display_name", "Remote, India"),
                    salary=salary_text,
                    match_percentage=max(match_val, 75),
                    redirect_url=job.get("redirect_url", "#")
                ))
    except Exception as e:
        print(f"Job search failed in dashboard: {e}")

    # Fallback internships if search returned none
    if not matched_internships:
        matched_internships = [
            MatchedInternship(
                id="1",
                title=f"SDE Intern ({current_user.target_role or 'Frontend/Backend'})",
                company="Google",
                location="Bengaluru / Remote",
                salary="₹85,000/mo",
                match_percentage=94,
                redirect_url="https://careers.google.com"
            ),
            MatchedInternship(
                id="2",
                title="AI / ML Engineering Intern",
                company="Microsoft",
                location="Hyderabad / Remote",
                salary="₹80,000/mo",
                match_percentage=89,
                redirect_url="https://careers.microsoft.com"
            ),
            MatchedInternship(
                id="3",
                title="Full Stack Developer Intern",
                company="Stripe",
                location="Remote",
                salary="₹75,000/mo",
                match_percentage=85,
                redirect_url="https://stripe.com/jobs"
            )
        ]

    # Metrics array
    metrics = [
        DashboardMetric(
            label="Placement Readiness",
            value=f"{placement_score}%" if has_any_activity else "Get Started",
            numeric_value=float(placement_score),
            icon_type="trophy",
            status="positive" if placement_score >= 75 else "warning" if placement_score >= 40 else "neutral",
            detail="30% Resume + 25% Quiz + 20% Interview + 15% Projects + 10% Skills"
        ),
        DashboardMetric(
            label="Resume ATS Score",
            value=f"{resume_ats}/100" if resumes else "No Resume",
            numeric_value=float(resume_ats),
            icon_type="file_check",
            status="positive" if resume_ats >= 80 else "warning" if resume_ats >= 60 else "neutral",
            detail=f"{len(resumes)} resume(s) uploaded/built"
        ),
        DashboardMetric(
            label="Quiz Accuracy",
            value=f"{quiz_score}%" if quiz_attempts else "Not Attempted",
            numeric_value=float(quiz_score),
            icon_type="brain",
            status="positive" if quiz_score >= 75 else "warning" if quiz_score >= 50 else "neutral",
            detail=f"{len(quiz_attempts)} attempt(s) across {len(quizzes)} quiz(zes)"
        ),
        DashboardMetric(
            label="Interview Score",
            value=f"{interview_score}/100" if completed_interviews else "Not Evaluated",
            numeric_value=float(interview_score),
            icon_type="target",
            status="positive" if interview_score >= 70 else "warning" if interview_score >= 50 else "neutral",
            detail=f"{len(completed_interviews)} completed of {len(interviews)} sessions"
        )
    ]

    return DashboardData(
        placement_readiness_score=placement_score,
        score_breakdown={
            "resume_ats": resume_ats,
            "quiz_score": quiz_score,
            "interview_score": interview_score,
            "project_score": project_score,
            "skill_score": skill_score
        },
        metrics=metrics,
        weak_skills=weak_skills[:6],
        matched_skills=matched_skills[:8],
        recommended_actions=actions[:4],
        recommended_internships=matched_internships,
        recent_activity=recent_activity,
        weekly_goals=weekly_goals,
        role_insights=role_insights,
        summary={
            "total_resumes": len(resumes),
            "total_quizzes": len(quizzes),
            "total_quiz_attempts": len(quiz_attempts),
            "total_interviews": len(interviews),
            "completed_interviews": len(completed_interviews),
            "total_roadmaps": len(roadmaps),
            "total_roadmap_tasks": total_roadmap_tasks,
            "completed_roadmap_tasks": completed_roadmap_tasks
        }
    )
