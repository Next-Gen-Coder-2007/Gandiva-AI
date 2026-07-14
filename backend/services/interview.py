from fastapi import HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from services.llm_service import gemini_service

# --- Internal Schemas for LLM Structured Output ---

class GeneratedQuestion(BaseModel):
    internal_assessment: str = Field(description="Hidden scratchpad: Evaluate the candidate's last answer. Are they struggling, excelling, or missing edge cases?")
    strategic_action: str = Field(description="Must be one of: CONTINUE, ASK_FOLLOW_UP, GIVE_HINT, INCREASE_DIFFICULTY, DECREASE_DIFFICULTY, CHALLENGE_CANDIDATE, PIVOT_TOPIC")
    question_text: str = Field(description="The complete spoken dialogue of the interviewer (reaction + next question)")
    category: str = Field(description="e.g., Technical, Behavioral, System Design, HR, Coding")

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


def clean_ai_hallucinations(text: str) -> str:
    """Aggressively strips boilerplate placeholders the LLM might hallucinate."""
    replacements = {
        "[Candidate Name]": "there",
        "[Candidate]": "there",
        "[Name]": "there",
        "[Company Name]": "our company",
        "[Company]": "our company",
        "[Role]": "this role",
        "[Insert Name]": "there"
    }
    for bad_text, good_text in replacements.items():
        text = text.replace(bad_text, good_text)
    print(text)
    return text

def generate_first_question(
    role: str, experience: str, difficulty: str, skills: str, company: str,
    resume_text: Optional[str] = None, job_description: Optional[str] = None
) -> GeneratedQuestion:
    
    resume_context = f"\n- Candidate Resume/Background:\n{resume_text}" if resume_text else ""
    jd_context = f"\n- Job Description Requirements:\n{job_description}" if job_description else ""
    
    prompt = f"""
    You are a Hiring Manager at {company or 'a tech company'}.
    You are conducting a professional interview for a '{role}' position.
    
    Your task is to generate your FIRST spoken dialogue.
    1. internal_assessment: Briefly note your plan.
    2. strategic_action: "CONTINUE".
    3. question_text: Introduce yourself and ask the first question.
    CRITICAL RULE: NEVER use brackets or placeholders like [Name]. Speak naturally.
    """

    try:
        raw_result = gemini_service(prompt, GeneratedQuestion)
        
        # Sledgehammer: Convert dict to object safely
        if isinstance(raw_result, dict):
            raw_result['question_text'] = clean_ai_hallucinations(raw_result.get('question_text', ''))
            return GeneratedQuestion(**raw_result)
            
        # If it's already an object, just sanitize and return
        raw_result.question_text = clean_ai_hallucinations(raw_result.question_text)
        return raw_result
        
    except Exception as e:
        print(f"CRASH in next_question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_next_question(
    role: str, experience: str, difficulty: str, skills: str, company: str,
    qa_history: List[dict], current_q_number: int, total_questions: int,
    resume_text: Optional[str] = None, job_description: Optional[str] = None
) -> GeneratedQuestion:
    
    formatted_history = "\n\n".join([f"Interviewer: {pair['question']}\nCandidate: {pair['answer']}" for pair in qa_history])
    
    prompt = f"""
    You are a Hiring Manager interviewing for a '{role}' position.
    This is Question {current_q_number} out of {total_questions}.
    
    Transcript so far:
    {formatted_history}
    
    Evaluate the last answer. Pick a strategic_action (ASK_FOLLOW_UP, GIVE_HINT, INCREASE_DIFFICULTY, etc.).
    Then generate the 'question_text'. 
    CRITICAL RULE: NEVER use brackets or placeholders like [Name]. 
    """
    try:
        raw_result = gemini_service(prompt, GeneratedQuestion)
        
        # Sledgehammer: Convert dict to object safely
        if isinstance(raw_result, dict):
            raw_result['question_text'] = clean_ai_hallucinations(raw_result.get('question_text', ''))
            return GeneratedQuestion(**raw_result)
            
        # If it's already an object, just sanitize and return
        raw_result.question_text = clean_ai_hallucinations(raw_result.question_text)
        return raw_result
        
    except Exception as e:
        print(f"CRASH in next_question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def evaluate_interview_answers(qa_pairs: List[dict], role: str, experience: str) -> AIEvaluationResult:
    # ... (Existing evaluation logic remains identical)
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