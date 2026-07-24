from fastapi import HTTPException
from schemas.interview import AIGeneratedQuestion, AIEvaluationResult
from services.llm_service import gemini_service
from models.interview import Interview

def generate_next_interview_question(interview: Interview, chat_history_text: str) -> str:
    prompt = (
        f"You are an expert technical interviewer at {interview.company or 'a top tech company'}. "
        f"You are conducting a {interview.difficulty} {interview.interview_type} interview for a {interview.role} position "
        f"with a candidate who has {interview.experience} experience. "
        f"Required skills to test: {interview.skills or 'Standard skills for this role'}.\n\n"
        f"Here is the transcript of the interview so far:\n{chat_history_text}\n\n"
        f"Based on the transcript, the role, and the required skills, generate the NEXT interview question. "
        f"If this is the first question, start with a welcoming introduction followed by the first technical question. "
        f"Keep the question conversational, concise, and professional. Return only the JSON object."
    )

    try:
        result = gemini_service(prompt, AIGeneratedQuestion)
        
        # Handle dict or Pydantic model return from your gemini_service
        if isinstance(result, dict):
            return result.get("question", "Could you elaborate on your experience?")
        return result.question
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI failed to generate question: {str(e)}"
        )

def generate_interview_evaluation(interview: Interview, chat_history_text: str) -> AIEvaluationResult:
    prompt = (
        f"You are an expert technical interviewer evaluator. You need to review the transcript of a completed "
        f"{interview.difficulty} {interview.interview_type} interview for a {interview.role} position "
        f"(Candidate experience: {interview.experience}).\n\n"
        f"Here is the full interview transcript:\n{chat_history_text}\n\n"
        f"Evaluate the candidate's performance based on their answers to the AI's questions. "
        f"Provide an overall score out of 10, list their strengths, areas for improvement, and detailed feedback for each question they answered. "
        f"Be constructive and professional."
    )

    try:
        return gemini_service(prompt, AIEvaluationResult)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI evaluation failed: {str(e)}"
        )