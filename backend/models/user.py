from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    
    # Career Profile Fields
    full_name = Column(String, nullable=True)
    target_role = Column(String, nullable=True)
    college = Column(String, nullable=True)
    branch = Column(String, nullable=True)
    cgpa = Column(Float, nullable=True)
    year = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    interview_tone_preference = Column(String, default="Encouraging & Helpful", nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())