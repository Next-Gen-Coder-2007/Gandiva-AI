from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum
from typing import Optional, List

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class ChoiceBase(BaseModel):
    choice_text: str
    is_correct: bool

class ChoiceResponse(ChoiceBase):
    id: int
    question_id: int
    
    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    question_text: str

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    choices: List[ChoiceResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class AnswerSubmit(BaseModel):
    question_id: int
    selected_choice_id: Optional[int] = None

class QuizAttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    started_at: datetime
    completed_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

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
    
    questions: List[QuestionResponse] = []
    attempts: List[QuizAttemptResponse] = []
    
    model_config = ConfigDict(from_attributes=True)