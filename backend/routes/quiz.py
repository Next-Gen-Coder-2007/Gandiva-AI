from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.quiz import Quiz as QuizResponse, QuizCreate, QuizAttemptResponse, QuizAttemptSubmit
from models.quiz import Quiz, QuestionResponse, QuizAttempt, Choice
from services.auth import get_current_user
from models.user import User
from typing import List
from sqlalchemy.sql import func

router = APIRouter(prefix="/quizzes", tags=["quizzes"])

@router.post("", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
def create_quiz(quiz: QuizCreate,  db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz_data = quiz.model_dump()
    new_quiz = Quiz(**quiz_data, user_id=current_user.id)
    
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    
    return new_quiz

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

@router.post("/{quiz_id}/attempts", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz_attempt(quiz_id: int, payload: QuizAttemptSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with id {quiz_id} not found"
        )

    new_attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        completed_at=func.now()
    )
    
    db.add(new_attempt)
    db.flush() 

    calculated_score = 0

    for answer in payload.answers:
        if answer.selected_choice_id is not None:
            choice = db.query(Choice).filter(Choice.id == answer.selected_choice_id).first()
            
            if choice and choice.is_correct:
                calculated_score += 1
                
        new_response = QuestionResponse(
            attempt_id=new_attempt.id,
            question_id=answer.question_id,
            selected_choice_id=answer.selected_choice_id
        )
        db.add(new_response)

    new_attempt.score = calculated_score
    db.commit()
    db.refresh(new_attempt)

    return new_attempt