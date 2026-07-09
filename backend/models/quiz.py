from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, JSON, Table
from sqlalchemy.orm import relationship
from db.database import Base
from sqlalchemy.sql import func

response_choices_association = Table(
    "response_choices",
    Base.metadata,
    Column("response_id", Integer, ForeignKey("question_responses.id", ondelete="CASCADE")),
    Column("choice_id", Integer, ForeignKey("choices.id", ondelete="CASCADE"))
)

class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    no_of_questions = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    marks = Column(Integer, default=1, nullable=False)
    settings = Column(JSON, nullable=True) 

    quiz = relationship("Quiz", back_populates="questions")
    choices = relationship("Choice", back_populates="question", cascade="all, delete-orphan")

class Choice(Base):
    __tablename__ = "choices"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    choice_text = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    
    question = relationship("Question", back_populates="choices")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0)
    
    responses = relationship("QuestionResponse", back_populates="attempt", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="attempts")

class QuestionResponse(Base):
    __tablename__ = "question_responses"
    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    
    text_response = Column(Text, nullable=True)
    
    attempt = relationship("QuizAttempt", back_populates="responses")
    awarded_marks = Column(Integer, default=0)
    selected_choice_id = Column(Integer, ForeignKey("choices.id"), nullable=True)
    selected_choices = relationship("Choice", secondary=response_choices_association)