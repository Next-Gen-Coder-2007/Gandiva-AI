from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class QuizBase(BaseModel):
    title: str
    difficulty: DifficultyLevel
    no_of_questions: int = Field(..., ge=1, le=50)

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        form_attributes = True