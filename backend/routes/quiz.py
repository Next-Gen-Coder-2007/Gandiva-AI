from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.quiz import Quiz as QuizResponse, QuizCreate, QuizAttemptResponse, QuizAttemptSubmit, ShortAnswerToGrade
from models.quiz import Quiz, QuestionResponse, QuizAttempt, Choice, Question
from services.auth import get_current_user
from models.user import User
from typing import List
from sqlalchemy.sql import func
from services.quiz import extract_data_with_gemini, grade_batch_short_answers_with_ai

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.post("", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_quiz = Quiz(**quiz.model_dump(), user_id=current_user.id)
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    try:
        ai_payload = extract_data_with_gemini(
            title=new_quiz.title,
            difficulty=quiz.difficulty,
            no_of_questions=new_quiz.no_of_questions
        )

        if hasattr(ai_payload, "model_dump"):
            payload_data = ai_payload.model_dump()
        elif hasattr(ai_payload, "dict"):
            payload_data = ai_payload.dict()
        elif isinstance(ai_payload, dict):
            payload_data = ai_payload
        else:
            payload_data = vars(ai_payload)

        questions_list = payload_data.get('questions', [])
        
        for q_data in questions_list:
            q_type = q_data.get('question_type')
            if hasattr(q_type, 'value'):
                q_type = q_type.value

            new_question = Question(
                quiz_id=new_quiz.id, 
                question_text=q_data.get('question_text'),
                question_type=q_type,
                marks=q_data.get('marks', 1),
                settings=q_data.get('settings')
            )

            db.add(new_question)
            db.flush()

            choices_list = q_data.get('choices', [])
            
            if choices_list:
                for c_data in choices_list:
                    new_choice = Choice(
                        question_id=new_question.id,
                        choice_text=c_data.get('choice_text'),
                        is_correct=c_data.get('is_correct')
                    )
                    db.add(new_choice)
                
        db.commit()
        db.refresh(new_quiz)
        
    except Exception as e:
        db.delete(new_quiz)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI generation failed, quiz creation aborted: {str(e)}"
        )
        
    return new_quiz

@router.post("/{quiz_id}/attempts", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz_attempt(quiz_id: int, payload: QuizAttemptSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    new_attempt = QuizAttempt(user_id=current_user.id, quiz_id=quiz_id, completed_at=func.now())
    db.add(new_attempt)
    db.flush() 

    total_score = 0
    db_responses = [] 
    answers_to_grade = []

    for answer in payload.answers:
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if not question:
            continue

        awarded_marks = 0
        db_response = QuestionResponse(attempt_id=new_attempt.id, question_id=question.id)

        if question.question_type in ["mcq", "true_false"]:
            db_response.selected_choice_id = answer.selected_choice_id
            choice = db.query(Choice).filter(Choice.id == answer.selected_choice_id).first()
            if choice and choice.is_correct:
                awarded_marks = question.marks

        elif question.question_type == "multi_choice":
            correct_choice_ids = {c.id for c in question.choices if c.is_correct}
            selected_ids = set(answer.selected_choice_ids or [])
            if correct_choice_ids and correct_choice_ids == selected_ids:
                awarded_marks = question.marks
            if selected_ids:
                selected_choices = db.query(Choice).filter(Choice.id.in_(selected_ids)).all()
                db_response.selected_choices.extend(selected_choices)

        elif question.question_type == "fill_blank":
            db_response.text_response = answer.text_response
            expected = question.settings.get("answer", "").strip().lower()
            user_text = (answer.text_response or "").strip().lower()
            if expected and user_text == expected:
                awarded_marks = question.marks

        elif question.question_type == "short_answer":
            db_response.text_response = answer.text_response
            user_text = (answer.text_response or "").strip()
            expected = question.settings.get("answer", "") if question.settings else ""
            
            if user_text:
                answers_to_grade.append(
                    ShortAnswerToGrade(
                        question_id=question.id,
                        question_text=question.question_text,
                        expected_answer=expected,
                        user_answer=user_text,
                        max_marks=question.marks
                    )
                )

        if question.question_type != "short_answer" or not db_response.text_response:
            db_response.awarded_marks = awarded_marks
            total_score += awarded_marks
            
        db_responses.append(db_response)

    if answers_to_grade:
        batch_grades = grade_batch_short_answers_with_ai(answers_to_grade)
        
        if hasattr(batch_grades, "model_dump"):
            batch_data = batch_grades.model_dump()
        elif hasattr(batch_grades, "dict"):
            batch_data = batch_grades.dict()
        elif isinstance(batch_grades, dict):
            batch_data = batch_grades
        else:
            batch_data = vars(batch_grades)

        results_list = batch_data.get('results', [])        
        grade_map = {res.get('question_id'): res for res in results_list if res.get('question_id') is not None}
        
        for db_response in db_responses:
            if db_response.question_id in grade_map:
                ai_grade = grade_map[db_response.question_id]
                awarded = ai_grade.get('awarded_marks', 0)                
                db_response.awarded_marks = awarded
                total_score += awarded

    new_attempt.score = total_score
    db.add_all(db_responses)
    db.commit()
    db.refresh(new_attempt)

    return new_attempt

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz_query = db.query(Quiz).filter(Quiz.id == quiz_id)
    quiz_to_delete = quiz_query.first()
    
    if not quiz_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Quiz with id {quiz_id} not found"
        )
        
    if quiz_to_delete.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to perform requested action"
        )
        
    quiz_query.delete(synchronize_session=False)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("", response_model=List[QuizResponse])
def get_user_quizzes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quizzes = db.query(Quiz).filter(Quiz.user_id == current_user.id).all()    
    return quizzes

@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz_by_id(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == current_user.id).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with id {quiz_id} not found"
        )
        
    return quiz

@router.get("/{quiz_id}/attempts/{attempt_id}", response_model=QuizAttemptResponse)
def get_quiz_attempt_details(quiz_id: int, attempt_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.id == attempt_id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == current_user.id
    ).first()

    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz attempt not found or you do not have permission to view it."
        )

    return attempt