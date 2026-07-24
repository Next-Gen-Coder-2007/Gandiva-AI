from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.resume import Resume as ResumeModel
from models.resume_analysis import ResumeAnalysis
from schemas.resume_analysis import ResumeAnalysisOutput, AnalyzeResumeRequest
from services.llm_service import gemini_service

def format_resume_to_text(resume: ResumeModel):
    lines = []
    lines.append(f"FULL NAME: {resume.full_name or 'N/A'}")
    lines.append(f"EMAIL: {resume.email or 'N/A'}")
    lines.append(f"PHONE: {resume.phone or 'N/A'}")
    lines.append(f"LOCATION: {resume.location or 'N/A'}")
    lines.append(f"LINKEDIN: {resume.linkedin or 'N/A'}")
    lines.append(f"GITHUB: {resume.github or 'N/A'}")
    lines.append(f"PORTFOLIO: {resume.portfolio or 'N/A'}\n")

    if resume.profile_summary:
        lines.append(f"PROFILE SUMMARY:\n{resume.profile_summary}\n")

    if resume.skills:
        lines.append("SKILLS:")
        for s in resume.skills:
            cat = f" [{s.category}]" if s.category else ""
            lines.append(f"- {s.skill}{cat}")
        lines.append("")

    if resume.experiences:
        lines.append("EXPERIENCE:")
        for exp in resume.experiences:
            dates = f" ({exp.start_date} to {exp.end_date if not exp.currently_working else 'Present'})"
            lines.append(f"- {exp.role} at {exp.company}{dates}")
            if exp.description:
                lines.append(f"  Description: {exp.description}")
        lines.append("")

    if resume.projects:
        lines.append("PROJECTS:")
        for p in resume.projects:
            tech = f" (Tech Stack: {p.tech_stack})" if p.tech_stack else ""
            lines.append(f"- {p.title}{tech}")
            if p.description:
                lines.append(f"  Description: {p.description}")
        lines.append("")

    if resume.educations:
        lines.append("EDUCATION:")
        for edu in resume.educations:
            dates = f" ({edu.start_date} to {edu.end_date})" if edu.start_date else ""
            lines.append(f"- {edu.degree} in {edu.field_of_study} from {edu.institution}{dates}")
            if edu.description:
                lines.append(f"  Description: {edu.description}")
        lines.append("")

    if resume.achievements:
        lines.append("ACHIEVEMENTS:")
        for ach in resume.achievements:
            lines.append(f"- {ach.title}: {ach.description or ''}")
        lines.append("")

    if resume.certificates:
        lines.append("CERTIFICATES:")
        for cert in resume.certificates:
            lines.append(f"- {cert.name} (Issued by: {cert.issuer or 'N/A'})")
        lines.append("")

    return "\n".join(lines)


def build_analysis_prompt(resume_text: str, target_job_title: Optional[str] = None, job_description: Optional[str] = None):
    is_job_specific = bool(job_description and job_description.strip())

    base_instructions = """
    You are an expert Applicant Tracking System (ATS) evaluator and senior technical recruiter.
    Analyze the provided candidate resume strictly using the following ground rules:

    STRICT GROUND RULES:
    1. FACTUAL GROUNDING: Do NOT invent, assume, or fabricate any experience, skills, certifications, or qualifications not explicitly stated in the resume text.
    2. NO FALSE SKILL ASSIGNMENT: Never claim a candidate possesses a skill unless there is clear direct evidence or explicit mention in the resume text.
    3. CLEAR DISTINCTION: Clearly distinguish between:
    - "Missing Information": Data or sections that are completely absent (e.g., no metrics provided, missing GitHub link).
    - "Weaknesses": Data that is present but poorly phrased, vague, or lacking impact.
    4. ATS EVALUATION: Assess key readability, section headers, quantifiable metrics, and keyword usage.
    """

    if is_job_specific:
        mode_instructions = f"""
        ANALYSIS MODE: MODE 2 - Job-Specific Analysis
        TARGET JOB TITLE: {target_job_title or 'Not specified'}

        TARGET JOB DESCRIPTION:
        \"\"\"
        {job_description.strip()}
        \"\"\"

        ADDITIONAL JOB-SPECIFIC RULES:
        - Systematically compare the explicit job requirements against the candidate's resume evidence.
        - Identify exact skills and keywords required by the job description that are matching vs missing in the candidate's resume.
        - Evaluate how relevant the candidate's past experience and projects are specifically for this target role.
        """
    else:
        mode_instructions = """
        ANALYSIS MODE: MODE 1 - General Resume Quality Analysis

        ADDITIONAL GENERAL RULES:
        - Evaluate general industry standards for professional resume formatting, clarity, and impact.
        - Identify general strengths, weak bullet points, and missing core professional resume sections.
        - Identify missing core industry skills and keywords based on general best practices for the candidate's domain.
        """

    prompt = f"""
    {base_instructions}
    {mode_instructions}

    CANDIDATE RESUME TEXT:
    \"\"\"
    {resume_text}
    \"\"\"

    Produce your complete analysis matching the requested JSON schema structure precisely.
    """
    return prompt


def run_resume_analysis(resume: ResumeModel, target_job_title: Optional[str] = None, job_description: Optional[str] = None):
    resume_text = format_resume_to_text(resume)

    prompt = build_analysis_prompt(
        resume_text=resume_text,
        target_job_title=target_job_title,
        job_description=job_description
    )

    analysis_dict = gemini_service(prompt=prompt, schema=ResumeAnalysisOutput)
    return analysis_dict

def process_and_save_analysis(db: Session, resume: ResumeModel, req: AnalyzeResumeRequest) -> ResumeAnalysis:
    try:
        ai_result = run_resume_analysis(
            resume=resume, 
            target_job_title=req.target_job_title, 
            job_description=req.job_description
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail="The AI service returned an invalid response. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred while analyzing the resume.")

    db_analysis = ResumeAnalysis(
        resume_id=resume.id,
        target_job_title=req.target_job_title,
        job_description=req.job_description,
        overall_score=ai_result.get("overall_score"),
        ats_score=ai_result.get("ats_score"),
        keyword_score=ai_result.get("keyword_score"),
        skills_score=ai_result.get("skills_score"),
        experience_score=ai_result.get("experience_score"),
        projects_score=ai_result.get("projects_score"),
        education_score=ai_result.get("education_score"),
        analysis_result=ai_result.get("section_analysis"), 
        strengths=ai_result.get("strengths"),
        weaknesses=ai_result.get("weaknesses"),
        matching_skills=ai_result.get("matching_skills"),
        missing_skills=ai_result.get("missing_skills"),
        matching_keywords=ai_result.get("matching_keywords"),
        missing_keywords=ai_result.get("missing_keywords"),
        suggestions=ai_result.get("suggestions")
    )

    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return db_analysis


def get_latest_analysis(db: Session, resume_id: int) -> ResumeAnalysis:
    return db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume_id).order_by(ResumeAnalysis.created_at.desc()).first()