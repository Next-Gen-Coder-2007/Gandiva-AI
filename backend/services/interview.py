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


# --- Service Functions ---

def generate_first_question(
    role: str, experience: str, difficulty: str, skills: str, company: str,
    resume_text: Optional[str] = None, job_description: Optional[str] = None
) -> GeneratedQuestion:
    
    resume_context = f"\n- Candidate Resume/Background:\n{resume_text}" if resume_text else ""
    jd_context = f"\n- Job Description Requirements:\n{job_description}" if job_description else ""
    
    prompt = f"""
    You are a Principal Engineering Manager and Expert Technical Interviewer at {company or 'a top-tier technology company'}.
    You are conducting a professional interview for a '{role}' position.
    
    Candidate & Role Context:
    - Experience Level: {experience or 'Not specified'}
    - Target Difficulty: {difficulty or 'Medium'}
    - Specific Skills to Test: {skills or 'Core competencies for the role'}{resume_context}{jd_context}
    
    Your task is to generate your FIRST spoken dialogue to kick off the interview.
    
    Rules:
    1. internal_assessment: Briefly note your plan for this opening.
    2. strategic_action: Set to "CONTINUE".
    3. question_text: Introduce yourself, welcome the candidate, acknowledge their resume if provided, and ask the first introductory question. Speak exactly as a human interviewer would.
    
    You must return the result STRICTLY matching the requested JSON schema.
    """
        
    try:
        return gemini_service(prompt, GeneratedQuestion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Initial Question Generation failed: {str(e)}")


def generate_next_question(
    role: str, experience: str, difficulty: str, skills: str, company: str,
    qa_history: List[dict], current_q_number: int, total_questions: int,
    resume_text: Optional[str] = None, job_description: Optional[str] = None
) -> GeneratedQuestion:
    
    formatted_history = "\n\n".join([f"Interviewer: {pair['question']}\nCandidate: {pair['answer']}" for pair in qa_history])
    resume_context = f"\n- Candidate Resume/Background:\n{resume_text}" if resume_text else ""
    jd_context = f"\n- Job Description Requirements:\n{job_description}" if job_description else ""
    
    prompt = f"""
    You are a Principal Engineering Manager and Expert Technical Interviewer at {company or 'a top-tier technology company'}.
    You are conducting an interview for a '{role}' position.
    
    This is Question {current_q_number} out of {total_questions}.
    
    Candidate & Role Context:
    - Experience Level: {experience or 'Not specified'}
    - Target Baseline Difficulty: {difficulty or 'Medium'}
    - Specific Skills to Test: {skills or 'Core competencies for the role'}{resume_context}{jd_context}
    
    Here is the conversation transcript so far:
    {formatted_history}
    
    Your task is to evaluate the candidate's last answer and generate your next spoken response.
    
    Step 1: internal_assessment
    Critique their last answer. Was it accurate? Too shallow? Did they miss an edge case? Are they struggling?
    
    Step 2: strategic_action
    Based on your assessment, pick ONE action:
    - ASK_FOLLOW_UP: They missed a detail, ask them to clarify.
    - GIVE_HINT: They are struggling, guide them gently.
    - DECREASE_DIFFICULTY: They failed the last question, ask something more foundational.
    - INCREASE_DIFFICULTY: They nailed it easily, push them harder.
    - CHALLENGE_CANDIDATE: Present an edge case that breaks their proposed solution.
    - PIVOT_TOPIC: Move to a new behavioral, HR, or technical skill area.
    
    Step 3: question_text (Your Spoken Dialogue)
    React naturally to their answer based on your chosen strategy, then ask the next question.
    - Example (Hint): "You're on the right track with the cache. But what happens if the cache goes down?"
    - Example (Challenge): "Great explanation. However, how would your database schema handle a sudden 10x spike in writes?"
    - Speak naturally, smoothly, and professionally. NEVER say "Next question".
    
    You must return the result STRICTLY matching the requested JSON schema.
    """
        
    try:
        return gemini_service(prompt, GeneratedQuestion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Next Question Generation failed: {str(e)}")


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