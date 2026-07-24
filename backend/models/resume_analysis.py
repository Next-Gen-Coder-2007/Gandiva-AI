from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    target_job_title = Column(String, nullable=True)
    job_description = Column(Text, nullable=True)
    
    overall_score = Column(Integer, nullable=True)
    ats_score = Column(Integer, nullable=True)
    keyword_score = Column(Integer, nullable=True)
    skills_score = Column(Integer, nullable=True)
    experience_score = Column(Integer, nullable=True)
    projects_score = Column(Integer, nullable=True)
    education_score = Column(Integer, nullable=True)
    
    analysis_result = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    matching_keywords = Column(JSON, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    resume = relationship("Resume", back_populates="analyses")