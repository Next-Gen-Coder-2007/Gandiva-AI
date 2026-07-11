from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from services.llm_service import gemini_service

# --- Internal Schemas for LLM Structured Output ---

class GeneratedQuestion(BaseModel):
    question_text: str = Field(description="The actual interview question")
    category: str = Field(description="e.g., Technical, Behavioral, System Design, HR")

class GeneratedQuestionsList(BaseModel):
    questions: List[GeneratedQuestion]

class AIEvaluationResult(BaseModel):
    communication_score: float = Field(ge=0, le=10)
    technical_score: float = Field(ge=0, le=10)
    confidence_score: float = Field(ge=0, le=10)
    problem_solving_score: float = Field(ge=0, le=10)
    accuracy_score: float = Field(ge=0, le=10)
    grammar_score: float = Field(ge=0, le=10)
    completeness_score: float = Field(ge=0, le=10)
    overall_score: float = Field(ge=0, le=10)
    detailed_explanation: str
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    learning_resources: List[str]
    recommended_roadmap: str
    recommended_quizzes: List[str]
    recommended_interview: str


# --- Service Functions ---

def generate_interview_questions(
    role: str, experience: str, difficulty: str, num_questions: int, skills: str, company: str
) -> GeneratedQuestionsList:
    
    prompt = f"""
    You are a Senior Engineering Manager and Expert Technical Interviewer at {company or 'a top-tier technology company'}.
    Your task is to generate exactly {num_questions} interview questions for a candidate applying for the '{role}' position.
    
    Candidate Context:
    - Experience Level: {experience or 'Not specified'}
    - Target Difficulty: {difficulty or 'Medium'}
    - Specific Skills to Test: {skills or 'Core competencies for the role'}
    
    Rules for Generation:
    1. Do not ask generic, easily searchable questions (e.g., "What is polymorphism?"). Instead, ask scenario-based or applied questions (e.g., "How would you design a system that heavily relies on polymorphism to handle different payment gateways?").
    2. Maintain a professional, challenging, yet fair tone.
    3. Ensure a mix of categories based on the role (e.g., Technical, System Design, Behavioral, Problem Solving).
    4. Ensure the questions progress logically.
    
    You must return the result STRICTLY matching the requested JSON schema.
    """
        
    try:
        return gemini_service(prompt, GeneratedQuestionsList)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Question Generation failed: {str(e)}")


def evaluate_interview_answers(qa_pairs: List[dict], role: str, experience: str) -> AIEvaluationResult:
    formatted_qa = "\n\n".join([f"Question: {pair['question']}\nCandidate Answer: {pair['answer']}" for pair in qa_pairs])
    
    prompt = f"""
    You are a strict but fair Principal Engineer and Hiring Manager evaluating a candidate for a '{role}' role (Experience: {experience}).
    
    Review the following transcript of the candidate's interview:
    
    {formatted_qa}
    
    Evaluation Rubric (Score 0.0 to 10.0):
    - Communication: Clarity, structure, and conciseness of the answer.
    - Technical: Depth of technical knowledge demonstrated. (Score 0 if skipped).
    - Confidence: Tone, decisiveness, and lack of filler words.
    - Problem Solving: Logical approach to complex scenarios.
    - Accuracy: Factual correctness of the technical claims.
    - Grammar: Language proficiency and professional vocabulary.
    - Completeness: Did they fully answer all parts of the question?
    
    Rules for Feedback:
    1. Be brutally honest but constructive. Do not flatter the candidate unnecessarily.
    2. If an answer is marked "[Candidate skipped or did not answer]", heavily penalize the Completeness and Technical scores for that specific question.
    3. 'strengths' and 'weaknesses' must be specific to their actual answers, not generic advice.
    4. 'recommended_roadmap' must be a concise, 3-4 sentence paragraph detailing exactly what they should study next.
    5. 'improvement_suggestions' must be actionable tasks (e.g., "Practice explaining database normalization without using jargon").
    
    You must return the result STRICTLY matching the requested JSON schema.
    """
    try:
        return gemini_service(prompt, AIEvaluationResult)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Evaluation failed: {str(e)}")