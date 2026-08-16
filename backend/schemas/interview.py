from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any

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
    code_snippet: Optional[str] = None
    language: Optional[str] = None

class HintRequest(BaseModel):
    user_query: Optional[str] = None

class HintResponse(BaseModel):
    hint: str

# --- AI Generation Schemas (For Gemini Structured Outputs) ---

class AIGeneratedQuestion(BaseModel):
    question: str = Field(description="The interview question to ask the candidate.")
    context_or_tip: Optional[str] = Field(default=None, description="Brief guidance on what good answers should cover.")

class DetailedQAFeedback(BaseModel):
    question: str
    user_answer: str
    feedback: str = Field(description="Constructive feedback on this specific answer, including what was good and what was missing.")
    code_snippet: Optional[str] = Field(default=None, description="Code provided by candidate, if any.")
    model_ideal_answer: Optional[str] = Field(default=None, description="Benchmark ideal answer or optimal approach/complexity.")

class AIEvaluationResult(BaseModel):
    overall_score: int = Field(ge=1, le=10, description="Overall score out of 10")
    technical_score: int = Field(default=7, ge=1, le=10, description="Technical accuracy score out of 10")
    communication_score: int = Field(default=7, ge=1, le=10, description="Clarity and articulation score out of 10")
    problem_solving_score: int = Field(default=7, ge=1, le=10, description="Problem solving and architectural reasoning score out of 10")
    recommendation: str = Field(default="Hire", description="Hire recommendation: Strong Hire, Hire, Leaning Hire, or Needs Practice")
    strengths: List[str] = Field(description="3 to 5 key strengths demonstrated by the candidate")
    areas_of_improvement: List[str] = Field(description="2 to 4 specific areas the candidate needs to improve")
    actionable_remediation: List[str] = Field(default=[], description="Actionable recommendations to prepare for future interviews")
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
    technical_score: Optional[int] = 7
    communication_score: Optional[int] = 7
    problem_solving_score: Optional[int] = 7
    recommendation: Optional[str] = "Hire"
    strengths: List[str]
    areas_of_improvement: List[str]
    actionable_remediation: Optional[List[str]] = []
    detailed_feedback: List[Dict[str, Any]]
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