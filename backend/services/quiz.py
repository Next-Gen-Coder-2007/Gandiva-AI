from fastapi import HTTPException
from schemas.quiz import AIGeneratedQuiz, DifficultyLevel
from services.llm_service import gemini_service

def extract_data_with_gemini(title: str, difficulty: DifficultyLevel, no_of_questions: int) -> dict:
    prompt = (
        f"Create a multiple-choice quiz about '{title}'. "
        f"The difficulty level must be {difficulty.value}. "
        f"Generate exactly {no_of_questions} questions. "
        f"Each question must have exactly 4 unique choices, and exactly one choice must be marked as correct. "
        f"You must return the response as a strict JSON object matching the provided schema."
    )

    try:
        return gemini_service(prompt, AIGeneratedQuiz)
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI Content generation or parsing failed: {str(e)}"
        )