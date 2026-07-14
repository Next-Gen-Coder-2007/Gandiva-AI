from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from db.database import Base
from sqlalchemy.sql import func

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String, nullable=False)
    current_status = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan")

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"
    
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    estimated_duration = Column(String, nullable=True) # NEW FIELD
    phase_order = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    
    roadmap = relationship("Roadmap", back_populates="phases")
    tasks = relationship("RoadmapTask", back_populates="phase", cascade="all, delete-orphan")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    resource_links = Column(Text, nullable=True)
    practical_exercise = Column(Text, nullable=True) # NEW FIELD
    interview_tips = Column(Text, nullable=True)     # NEW FIELD
    is_completed = Column(Boolean, default=False)
    
    phase = relationship("RoadmapPhase", back_populates="tasks")