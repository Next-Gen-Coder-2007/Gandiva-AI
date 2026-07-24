from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# --- Frontend Payloads ---

class InterviewCreate(BaseModel):
    role: str
    experience: str = "Fresher"
    difficulty: str = "Medium"
    interview_type: str = "Technical"
    num_questions: int = Field(default=5, ge=1, le=10)
    company: Optional[str] = None
    skills: Optional[str] = None

class AnswerSubmit(BaseModel):
    text: str

# --- AI Generation Schemas (For Gemini Structured Outputs) ---

class AIGeneratedQuestion(BaseModel):
    question: str = Field(description="The interview question to ask the candidate.")

class DetailedQAFeedback(BaseModel):
    question: str
    user_answer: str
    feedback: str = Field(description="Constructive feedback on this specific answer, including what was good and what was missing.")

class AIEvaluationResult(BaseModel):
    overall_score: int = Field(ge=1, le=10, description="Overall score out of 10")
    strengths: List[str] = Field(description="3 to 5 key strengths demonstrated by the candidate")
    areas_of_improvement: List[str] = Field(description="2 to 4 specific areas the candidate needs to improve")
    detailed_feedback: List[DetailedQAFeedback] = Field(description="Feedback for every question asked during the interview")

# --- Response Schemas ---

class InterviewMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class InterviewEvaluationResponse(BaseModel):
    id: int
    overall_score: int
    strengths: List[str]
    areas_of_improvement: List[str]
    detailed_feedback: List[DetailedQAFeedback]
    model_config = ConfigDict(from_attributes=True)

class InterviewResponse(BaseModel):
    id: int
    role: str
    company: Optional[str]
    difficulty: str
    interview_type: str
    status: str
    current_question_index: int
    num_questions: int
    created_at: Optional[datetime] = None
    chat_history: List[InterviewMessageResponse] = []
    evaluation: Optional[InterviewEvaluationResponse] = None
    
    model_config = ConfigDict(from_attributes=True)