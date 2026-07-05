from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    profile_summary = Column(Text)
    full_name = Column(String)
    email = Column(String)
    phone = Column(String)
    location = Column(String)
    linkedin = Column(String)
    github = Column(String)
    portfolio = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    skills = relationship("Skill", back_populates="resume", cascade="all, delete-orphan")
    languages = relationship("Language", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="resume", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="resume", cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="resume", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="resume", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    category = Column(String)
    skill = Column(String)

    resume = relationship("Resume", back_populates="skills")

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    language = Column(String)
    proficiency = Column(String)

    resume = relationship("Resume", back_populates="languages")

class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    institution = Column(String)
    degree = Column(String)
    field_of_study = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    grade = Column(String)
    description = Column(Text)

    resume = relationship("Resume", back_populates="educations")

class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    company = Column(String)
    role = Column(String)
    location = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)
    currently_working = Column(Boolean)
    description = Column(Text)

    resume = relationship("Resume", back_populates="experiences")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    title = Column(String)
    tech_stack = Column(Text)
    github = Column(String)
    live_demo = Column(String)
    description = Column(Text)

    resume = relationship("Resume", back_populates="projects")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    title = Column(String)
    description = Column(Text)

    resume = relationship("Resume", back_populates="achievements")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"))
    name = Column(String)
    issuer = Column(String)
    issue_date = Column(Date)
    credential_id = Column(String)
    credential_url = Column(String)

    resume = relationship("Resume", back_populates="certificates")