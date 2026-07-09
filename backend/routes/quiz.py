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
        
        for q_data in ai_payload.questions:
            new_question = Question(
                quiz_id=new_quiz.id, 
                question_text=q_data.question_text,
                question_type=q_data.question_type.value,
                settings=q_data.settings
            )
            db.add(new_question)
            db.flush()
            
            # Only add choices if the AI generated them (Short answer/Fill blanks might not have them)
            if q_data.choices:
                for c_data in q_data.choices:
                    new_choice = Choice(
                        question_id=new_question.id,
                        choice_text=c_data.choice_text,
                        is_correct=c_data.is_correct
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
        
        grade_map = {res.question_id: res for res in batch_grades.results}
        
        for db_response in db_responses:
            if db_response.question_id in grade_map:
                ai_grade = grade_map[db_response.question_id]
                db_response.awarded_marks = ai_grade.awarded_marks
                total_score += ai_grade.awarded_marks

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