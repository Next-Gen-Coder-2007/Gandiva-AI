from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Date
from db.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    no_of_questions = Column(Integer, nullable=False)