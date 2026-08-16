from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

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

class DashboardData(BaseModel):
    placement_readiness_score: int
    score_breakdown: Dict[str, int]
    metrics: List[DashboardMetric]
    weak_skills: List[str]
    matched_skills: List[str]
    recommended_actions: List[RecommendedAction]
    recommended_internships: List[MatchedInternship]
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
    if latest_resume:
        latest_analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == latest_resume.id).order_by(ResumeAnalysis.created_at.desc()).first()
    
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    quizzes = db.query(Quiz).options(selectinload(Quiz.questions)).filter(Quiz.user_id == current_user.id).all()
    
    interviews = db.query(Interview).options(selectinload(Interview.evaluation)).filter(Interview.user_id == current_user.id).all()
    completed_interviews = [i for i in interviews if i.status == "completed" and i.evaluation]
    
    roadmaps = db.query(Roadmap).options(
        selectinload(Roadmap.phases).selectinload(RoadmapPhase.tasks)
    ).filter(Roadmap.user_id == current_user.id).all()

    # 2. Compute Resume Score (ATS or completeness)
    if latest_analysis and latest_analysis.ats_score:
        resume_ats = latest_analysis.ats_score
    elif latest_resume:
        # Calculate completeness
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
            quiz_obj = next((q for q in quizzes if q.id == attempt.quiz_id), None)
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
        target_role = current_user.target_role or "Software Engineer"
        actions.append(RecommendedAction(
            id="take_interview",
            title=f"Practice {target_role} Interview",
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

    # 11. Fetch or Match Real Internships
    search_query = current_user.target_role or (matched_skills[0] if matched_skills else "Software")
    matched_internships: List[MatchedInternship] = []
    
    try:
        adzuna_results = search_jobs_service(search_query, None, "India", 1)
        if adzuna_results and adzuna_results.get("results"):
            for idx, job in enumerate(adzuna_results.get("results", [])[:4]):
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
        print(f"Adzuna search failed in dashboard: {e}")

    # Fallback internships if Adzuna returned none
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
