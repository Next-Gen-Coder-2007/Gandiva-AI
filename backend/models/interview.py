from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from db.database import Base
from sqlalchemy.sql import func

class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    role = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    company = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    
    num_questions = Column(Integer, default=5, nullable=False)
    current_question_index = Column(Integer, default=0, nullable=False)
    status = Column(String, default="in_progress") # in_progress, completed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    chat_history = relationship("InterviewMessage", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewMessage.created_at")
    evaluation = relationship("InterviewEvaluation", back_populates="interview", uselist=False, cascade="all, delete-orphan")

class InterviewMessage(Base):
    __tablename__ = "interview_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False) # 'ai' or 'user'
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    interview = relationship("Interview", back_populates="chat_history")

class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    overall_score = Column(Integer, nullable=False)
    strengths = Column(JSON, nullable=False) # List of strings
    areas_of_improvement = Column(JSON, nullable=False) # List of strings
    detailed_feedback = Column(JSON, nullable=False) # List of dicts: {question, user_answer, feedback}
    
    interview = relationship("Interview", back_populates="evaluation")