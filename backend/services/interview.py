from fastapi import HTTPException
from schemas.interview import AIGeneratedQuestion, AIEvaluationResult, HintResponse
from services.llm_service import gemini_service
from models.interview import Interview

def generate_next_interview_question(interview: Interview, chat_history_text: str) -> str:
    company_name = interview.company or "a Tier-1 Global Tech Enterprise"
    
    prompt = (
        f"You are a Principal Engineering Interviewer at {company_name}. "
        f"You are conducting an authentic {interview.difficulty} level {interview.interview_type} mock interview "
        f"for a {interview.role} candidate with {interview.experience} experience level.\n"
        f"Target skills & concepts to evaluate: {interview.skills or 'Core CS, System Design, Coding, Problem Solving'}.\n\n"
        f"Interview Transcript so far:\n{chat_history_text}\n\n"
        f"Instructions:\n"
        f"1. Generate the NEXT concise, high-caliber interview question.\n"
        f"2. If this is question #1, provide a warm 1-sentence professional greeting, then state the first question clearly.\n"
        f"3. If previous answers exist, reference them naturally (e.g. 'Great approach on caching. Now let us consider...') before presenting the next challenge.\n"
        f"4. For Coding/DSA questions, specify constraints or sample inputs.\n"
        f"5. For Behavioral questions, request concrete situations using the STAR method (Situation, Task, Action, Result).\n"
        f"Return strictly the requested JSON."
    )

    try:
        result = gemini_service(prompt, AIGeneratedQuestion)
        if isinstance(result, dict):
            return result.get("question", "Could you explain your architectural approach to this problem?")
        return result.question
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI failed to generate interview question: {str(e)}"
        )

def generate_interview_hint(interview: Interview, current_question: str, user_query: str = "") -> str:
    prompt = (
        f"You are the technical interviewer at {interview.company or 'a top tech company'}. "
        f"The candidate is working on this question:\n'{current_question}'\n"
        f"Candidate asked: '{user_query or 'Could you give me a slight hint on the approach or edge cases?'}'\n\n"
        f"Provide a helpful, subtle interviewer hint without giving away the full answer. "
        f"Keep it under 3 sentences, encouraging and professional."
    )
    
    try:
        result = gemini_service(prompt, HintResponse)
        if isinstance(result, dict):
            return result.get("hint", "Consider thinking about time vs space trade-offs or breaking down the problem into smaller sub-problems.")
        return result.hint
    except Exception as e:
        return "Think about the core data structures that provide O(1) or O(log N) lookup times, and consider edge cases like empty inputs."

def generate_interview_evaluation(interview: Interview, chat_history_text: str) -> AIEvaluationResult:
    company_name = interview.company or "Tier-1 Tech Enterprise"
    
    prompt = (
        f"You are the Bar Raiser & Hiring Committee Lead at {company_name}. "
        f"You are conducting a formal assessment of a candidate who completed a "
        f"{interview.difficulty} {interview.interview_type} interview for the position of {interview.role} "
        f"(Experience: {interview.experience}).\n\n"
        f"Full Interview Transcript & Candidate Code/Answers:\n{chat_history_text}\n\n"
        f"Conduct an exhaustive evaluation according to engineering hiring standards:\n"
        f"1. Score Overall (1-10), Technical Proficiency (1-10), Communication Clarity (1-10), and Problem Solving (1-10).\n"
        f"2. Assign a Hiring Recommendation: 'Strong Hire', 'Hire', 'Leaning Hire', or 'Needs Practice'.\n"
        f"3. List 3-5 specific Strengths demonstrated in their responses.\n"
        f"4. List 2-4 concrete Areas for Improvement.\n"
        f"5. Provide 2-3 Actionable Remediation recommendations (e.g. topic drills, concurrency, system design patterns).\n"
        f"6. For EACH question in the transcript, evaluate their answer and provide the benchmark optimal solution or approach ('model_ideal_answer').\n\n"
        f"Return strictly the JSON object adhering to the schema."
    )

    try:
        return gemini_service(prompt, AIEvaluationResult)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI evaluation failed: {str(e)}"
        )