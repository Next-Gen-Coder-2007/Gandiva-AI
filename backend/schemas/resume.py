from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class SkillSchema(BaseModel):
    category: Optional[str] = None
    skill: Optional[str] = None

class LanguageSchema(BaseModel):
    language: Optional[str] = None
    proficiency: Optional[str] = None

class EducationSchema(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class ExperienceSchema(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currently_working: Optional[bool] = False
    description: Optional[str] = None

class ProjectSchema(BaseModel):
    title: Optional[str] = None
    tech_stack: Optional[str] = None
    github: Optional[str] = None
    live_demo: Optional[str] = None
    description: Optional[str] = None

class AchievementSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class CertificateSchema(BaseModel):
    name: Optional[str] = None
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

class ThemeSchema(BaseModel):
    theme: Optional[str] = None
    color: Optional[str] = None

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
    theme: Optional[str] = None
    color: Optional[str] = None

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

class ParsedSkill(BaseModel):
    category: Optional[str] = Field(description="e.g., Backend, Frontend, Soft Skills")
    skill: Optional[str] = Field(description="The specific skill name")

class ParsedLanguage(BaseModel):
    language: Optional[str] = None
    proficiency: Optional[str] = Field(description="e.g., Native, Fluent, Beginner")

class ParsedEducation(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = Field(description="Format YYYY-MM-DD if possible")
    end_date: Optional[str] = Field(description="Format YYYY-MM-DD if possible")
    grade: Optional[str] = None
    description: Optional[str] = None

class ParsedExperience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = Field(description="Format YYYY-MM-DD if possible")
    end_date: Optional[str] = Field(description="Format YYYY-MM-DD if possible")
    currently_working: Optional[bool] = False
    description: Optional[str] = None

class ParsedProject(BaseModel):
    title: Optional[str] = None
    tech_stack: Optional[str] = Field(description="Comma separated list of technologies used")
    github: Optional[str] = None
    live_demo: Optional[str] = None
    description: Optional[str] = None

class ParsedAchievement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class ParsedCertificate(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    issue_date: Optional[str] = Field(description="Format YYYY-MM-DD if possible")
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class ParsedResumeData(BaseModel):
    profile_summary: Optional[str] = None
    theme: Optional[str] = None
    color: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    skills: List[ParsedSkill] = []
    languages: List[ParsedLanguage] = []
    educations: List[ParsedEducation] = []
    experiences: List[ParsedExperience] = []
    projects: List[ParsedProject] = []
    achievements: List[ParsedAchievement] = []
    certificates: List[ParsedCertificate] = []

    class Config:
        from_attributes = True