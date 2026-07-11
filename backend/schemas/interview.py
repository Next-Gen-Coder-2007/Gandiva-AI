from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class InterviewCreate(BaseModel):
    role: str
    experience: Optional[str] = None
    difficulty: Optional[str] = None
    interview_type: Optional[str] = None
    duration: Optional[int] = 30
    num_questions: Optional[int] = 5
    skills: Optional[str] = None
    company: Optional[str] = None
    resume_text: Optional[str] = None 
    job_description: Optional[str] = None

class InterviewAnswerSubmit(BaseModel):
    answer_text: str
    time_taken: Optional[int] = 0

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    category: Optional[str] = None
    order_index: Optional[int] = None

    class Config:
        from_attributes = True

class InterviewFeedbackResponse(BaseModel):
    id: int
    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    improvement_suggestions: Optional[List[str]] = []
    learning_resources: Optional[List[str]] = []
    recommended_roadmap: Optional[str] = None
    recommended_quizzes: Optional[List[str]] = []
    recommended_interview: Optional[str] = None

    class Config:
        from_attributes = True

class InterviewEvaluationResponse(BaseModel):
    id: int
    communication_score: Optional[float] = None
    technical_score: Optional[float] = None
    confidence_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    accuracy_score: Optional[float] = None
    grammar_score: Optional[float] = None
    completeness_score: Optional[float] = None
    overall_score: Optional[float] = None
    detailed_explanation: Optional[str] = None
    feedback: Optional[InterviewFeedbackResponse] = None

    class Config:
        from_attributes = True

class InterviewSessionResponse(BaseModel):
    id: int
    role: str
    experience: Optional[str] = None
    difficulty: Optional[str] = None
    interview_type: Optional[str] = None
    status: str
    duration: Optional[int] = None
    num_questions: Optional[int] = None
    company: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    evaluation: Optional[InterviewEvaluationResponse] = None

    class Config:
        from_attributes = True