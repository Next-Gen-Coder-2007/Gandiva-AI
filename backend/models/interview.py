from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    experience = Column(String)
    difficulty = Column(String)
    interview_type = Column(String)
    duration = Column(Integer) 
    num_questions = Column(Integer)
    skills = Column(Text) 
    company = Column(String)
    status = Column(String, default="pending") # pending, in_progress, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")
    evaluation = relationship("InterviewEvaluation", back_populates="session", uselist=False, cascade="all, delete-orphan")
    history = relationship("InterviewHistory", back_populates="session", uselist=False, cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    question_text = Column(Text, nullable=False)
    category = Column(String) 
    order_index = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id"))
    answer_text = Column(Text, nullable=False)
    time_taken = Column(Integer) # in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    question = relationship("InterviewQuestion", back_populates="answer")


class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    communication_score = Column(Float)
    technical_score = Column(Float)
    confidence_score = Column(Float)
    problem_solving_score = Column(Float)
    accuracy_score = Column(Float)
    grammar_score = Column(Float)
    completeness_score = Column(Float)
    overall_score = Column(Float)
    detailed_explanation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("InterviewSession", back_populates="evaluation")
    feedback = relationship("InterviewFeedback", back_populates="evaluation", uselist=False, cascade="all, delete-orphan")


class InterviewFeedback(Base):
    __tablename__ = "interview_feedback"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("interview_evaluations.id"))
    strengths = Column(JSON) 
    weaknesses = Column(JSON) 
    improvement_suggestions = Column(JSON)
    learning_resources = Column(JSON)
    recommended_roadmap = Column(Text)
    recommended_quizzes = Column(JSON)
    recommended_interview = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluation = relationship("InterviewEvaluation", back_populates="feedback")


class InterviewHistory(Base):
    __tablename__ = "interview_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    report_summary = Column(Text)
    is_deleted = Column(Integer, default=0) # Soft delete flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("InterviewSession", back_populates="history")