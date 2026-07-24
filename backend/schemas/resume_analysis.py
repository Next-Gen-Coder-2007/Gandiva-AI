from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class SectionFeedback(BaseModel):
    section_name: str = Field(
        description="Name of the resume section (e.g., 'Summary', 'Skills', 'Work Experience', 'Projects', 'Education')"
    )
    score: int = Field(
        description="Score from 0 to 100 evaluating the quality and impact of this specific section"
    )
    strengths: List[str] = Field(
        description="Explicit strengths observed in this section based on provided resume content"
    )
    weaknesses: List[str] = Field(
        description="Weaknesses or sub-optimal details in this section"
    )
    missing_information: List[str] = Field(
        description="Information that is absent from this section but expected in a professional resume"
    )
    suggestions: List[str] = Field(
        description="Targeted suggestions for improving this specific section"
    )

class PrioritizedSuggestion(BaseModel):
    priority: str = Field(
        description="Priority ranking: 'High', 'Medium', or 'Low'"
    )
    category: str = Field(
        description="The target category or section (e.g., 'ATS Formatting', 'Action Verbs', 'Job Alignment')"
    )
    actionable_advice: str = Field(
        description="Concrete, step-by-step recommendation on what to change or add"
    )

class ResumeAnalysisOutput(BaseModel):
    overall_score: int = Field(description="Overall resume quality score from 0 to 100")
    ats_score: int = Field(description="ATS compatibility score from 0 to 100")
    keyword_score: int = Field(description="Keyword optimization score from 0 to 100")
    skills_score: int = Field(description="Skills relevance, depth, and presentation score from 0 to 100")
    experience_score: int = Field(description="Work experience impact and measurement score from 0 to 100")
    projects_score: int = Field(description="Projects execution and tech stack score from 0 to 100")
    education_score: int = Field(description="Education section complete and formatting score from 0 to 100")

    summary: str = Field(
        description="Comprehensive summary overview of the analysis findings"
    )

    strengths: List[str] = Field(description="Key overall strengths of the resume")
    weaknesses: List[str] = Field(description="Key overall weaknesses in the resume")

    matching_skills: List[str] = Field(
        description="Skills present in the resume that align with industry standards (Mode 1) or target job description (Mode 2)"
    )
    missing_skills: List[str] = Field(
        description="Crucial skills absent from the resume for target role/industry standards"
    )

    matching_keywords: List[str] = Field(
        description="Keywords found in the resume matching target job or industry requirements"
    )
    missing_keywords: List[str] = Field(
        description="Important keywords missing from the resume that would boost ATS screening"
    )

    section_analysis: List[SectionFeedback] = Field(
        description="Detailed section-by-section breakdown of the resume"
    )
    suggestions: List[PrioritizedSuggestion] = Field(
        description="List of prioritized, actionable improvement recommendations"
    )

class AnalyzeResumeRequest(BaseModel):
    target_job_title: Optional[str] = Field(None, max_length=150, description="The title of the target job")
    job_description: Optional[str] = Field(
        None, 
        max_length=15000, 
        description="The full job description for Mode 2 matching. Capped at 15000 characters."
    )

# --- Response Schema (Database Representation) ---
class ResumeAnalysisResponseDB(BaseModel):
    id: int
    resume_id: int
    target_job_title: Optional[str]
    job_description: Optional[str]
    
    overall_score: Optional[int]
    ats_score: Optional[int]
    keyword_score: Optional[int]
    skills_score: Optional[int]
    experience_score: Optional[int]
    projects_score: Optional[int]
    education_score: Optional[int]
    
    analysis_result: Optional[List[Dict[str, Any]]] # Maps to section_analysis
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    matching_skills: Optional[List[str]]
    missing_skills: Optional[List[str]]
    matching_keywords: Optional[List[str]]
    missing_keywords: Optional[List[str]]
    suggestions: Optional[List[Dict[str, Any]]]
    
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True