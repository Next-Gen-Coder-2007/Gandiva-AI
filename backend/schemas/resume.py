from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class SkillSchema(BaseModel):
    category: Optional[str] = None
    skill: str

class LanguageSchema(BaseModel):
    language: str
    proficiency: Optional[str] = None

class EducationSchema(BaseModel):
    institution: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class ExperienceSchema(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_working: Optional[bool] = False
    description: Optional[str] = None

class ProjectSchema(BaseModel):
    title: str
    tech_stack: Optional[str] = None
    github: Optional[str] = None
    live_demo: Optional[str] = None
    description: Optional[str] = None

class AchievementSchema(BaseModel):
    title: str
    description: Optional[str] = None

class CertificateSchema(BaseModel):
    name: str
    issuer: Optional[str] = None
    issue_date: Optional[date] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class PersonalInfoSchema(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    portfolio: str | None = None
    profile_summary: str | None = None

class ResumeBase(BaseModel):
    title: str
    profile_summary: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class ResumeCreate(ResumeBase):
    skills: List[SkillSchema] = []
    languages: List[LanguageSchema] = []
    educations: List[EducationSchema] = []
    experiences: List[ExperienceSchema] = []
    projects: List[ProjectSchema] = []
    achievements: List[AchievementSchema] = []
    certificates: List[CertificateSchema] = []

class Resume(ResumeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    skills: List[SkillSchema] = []
    languages: List[LanguageSchema] = []
    educations: List[EducationSchema] = []
    experiences: List[ExperienceSchema] = []
    projects: List[ProjectSchema] = []
    achievements: List[AchievementSchema] = []
    certificates: List[CertificateSchema] = []

    class Config:
        from_attributes = True