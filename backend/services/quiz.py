from fastapi import HTTPException
from typing import List
from schemas.quiz import AIGeneratedQuiz, DifficultyLevel, BatchGradeResponse, ShortAnswerToGrade, GradedShortAnswer
from services.llm_service import gemini_service

def extract_data_with_gemini(title: str, difficulty: DifficultyLevel, no_of_questions: int):
    prompt = (
        f"Create a quiz about '{title}'. The difficulty level must be {difficulty.value}. "
        f"Generate exactly {no_of_questions} questions. "
        f"Include a mix of the following question types: "
        f"1. 'mcq' (4 choices, 1 correct)\n"
        f"2. 'multi_choice' (4 choices, 2 or more correct)\n"
        f"3. 'true_false' (2 choices: True and False, 1 correct)\n"
        f"4. 'short_answer' (No choices. Include the correct answer text in the 'settings' JSON field like {{'answer': 'Expected text'}})\n"
        f"5. 'fill_blank' (No choices. Include the correct missing word in the 'settings' JSON field like {{'answer': 'Expected text'}})\n"
        f"You must return the response as a strict JSON object matching the provided schema exactly."
    )

    try:
        return gemini_service(prompt, AIGeneratedQuiz)
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI Content generation or parsing failed: {str(e)}"
        )


def grade_batch_short_answers_with_ai(answers_to_grade: List[ShortAnswerToGrade]) -> BatchGradeResponse:
    if not answers_to_grade:
        return BatchGradeResponse(results=[])

    answers_text = ""
    for item in answers_to_grade:
        answers_text += (
            f"Question ID: {item.question_id}\n"
            f"Question: {item.question_text}\n"
            f"Expected Concept/Answer: {item.expected_answer}\n"
            f"Student's Answer: {item.user_answer}\n"
            f"Maximum Marks Possible: {item.max_marks}\n"
            f"---\n"
        )

    prompt = (
        f"You are an expert teacher grading a batch of short answer questions.\n"
        f"Here are the student's submissions:\n\n"
        f"{answers_text}\n"
        f"Evaluate each answer based on the Expected Concept. Give full marks if correct, partial marks if partially correct, "
        f"and 0 if completely wrong. Be lenient with spelling/grammar; focus on the core concept.\n"
        f"Return a strict JSON object matching the provided schema, containing a list of results mapped strictly to their Question IDs."
    )
    
    try:
        return gemini_service(prompt, BatchGradeResponse)
    except Exception as e:
        print(f"Batch AI Grading failed: {e}")
        fallback_results = [
            GradedShortAnswer(question_id=ans.question_id, awarded_marks=0, feedback="Grading system error.")
            for ans in answers_to_grade
        ]
        return BatchGradeResponse(results=fallback_results)