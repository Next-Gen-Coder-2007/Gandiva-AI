from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class QuestionType(str, Enum):
    mcq = "mcq"
    multi_choice = "multi_choice"
    true_false = "true_false"
    short_answer = "short_answer"
    fill_blank = "fill_blank"

class ChoiceBase(BaseModel):
    choice_text: str
    is_correct: bool

class ChoiceResponse(ChoiceBase):
    id: int
    question_id: int
    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    question_text: str
    question_type: str
    marks: int = 1
    settings: Optional[Dict[str, Any]] = None

class QuestionResponseSchema(QuestionBase):
    id: int
    quiz_id: int
    choices: List[ChoiceResponse] = []
    model_config = ConfigDict(from_attributes=True)

class AnswerSubmit(BaseModel):
    question_id: int
    selected_choice_id: Optional[int] = None
    selected_choice_ids: Optional[List[int]] = None  # For multi_choice
    text_response: Optional[str] = None              # For short_answer & fill_blank

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

# AI Generation Schemas
class AIGeneratedChoice(BaseModel):
    choice_text: str
    is_correct: bool

class AIGeneratedQuestion(BaseModel):
    question_text: str
    question_type: QuestionType
    settings: Optional[Dict[str, Any]] = None
    marks: int = Field(default=1, ge=1, le=10)
    choices: Optional[List[AIGeneratedChoice]] = []

class ShortAnswerToGrade(BaseModel):
    question_id: int
    question_text: str
    expected_answer: str
    user_answer: str
    max_marks: int

class GradedShortAnswer(BaseModel):
    question_id: int
    awarded_marks: int
    feedback: str

class BatchGradeResponse(BaseModel):
    results: List[GradedShortAnswer]

class AIGeneratedQuiz(BaseModel):
    questions: List[AIGeneratedQuestion]

class Quiz(QuizBase):
    id: int
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponseSchema] = []
    attempts: List[QuizAttemptResponse] = []
    model_config = ConfigDict(from_attributes=True)