from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List

from db.database import get_db
from models.user import User
from services.auth import get_current_user

from schemas.interview import (
    InterviewCreate, InterviewResponse, AnswerSubmit, 
    HintRequest, HintResponse
)
from models.interview import Interview, InterviewMessage, InterviewEvaluation
from services.interview import (
    generate_next_interview_question, 
    generate_interview_evaluation,
    generate_interview_hint
)

router = APIRouter(prefix="/interviews", tags=["interviews"])

def build_chat_transcript(messages: List[InterviewMessage]) -> str:
    if not messages:
        return "No conversation yet."
    return "\n\n".join([f"{'Interviewer' if m.role == 'ai' else 'Candidate'}:\n{m.content}" for m in messages])

@router.post("", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview_session(payload: InterviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Create Interview Session
    new_interview = Interview(**payload.model_dump(), user_id=current_user.id)
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    # 2. Generate First Question
    first_question_text = generate_next_interview_question(new_interview, build_chat_transcript([]))
    
    # 3. Save AI Message
    ai_msg = InterviewMessage(interview_id=new_interview.id, role="ai", content=first_question_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(new_interview)
    
    return new_interview

@router.get("", response_model=List[InterviewResponse])
def get_user_interviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview_details(interview_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
        
    return interview

@router.post("/{interview_id}/hint", response_model=HintResponse)
def get_interview_hint(
    interview_id: int, 
    payload: HintRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
        
    last_ai_msg = next((m.content for m in reversed(interview.chat_history) if m.role == "ai"), "Current technical question")
    hint_text = generate_interview_hint(interview, last_ai_msg, payload.user_query or "")
    return HintResponse(hint=hint_text)

@router.post("/{interview_id}/answers", response_model=InterviewResponse)
def submit_answer(interview_id: int, payload: AnswerSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
    
    if interview.status == "completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview is already completed")
        
    # Format Answer Content with Code if supplied
    content = payload.text.strip()
    if payload.code_snippet and payload.code_snippet.strip():
        lang = payload.language or "text"
        content += f"\n\n```{lang}\n{payload.code_snippet.strip()}\n```"

    # 1. Save User's Answer
    user_msg = InterviewMessage(interview_id=interview.id, role="user", content=content)
    db.add(user_msg)
    db.flush()
    
    # Check if we should ask another question or if we reached the limit
    if interview.current_question_index < interview.num_questions - 1:
        interview.current_question_index += 1
        db.commit()
        
        # 2. Generate Next AI Question
        transcript = build_chat_transcript(interview.chat_history)
        next_q_text = generate_next_interview_question(interview, transcript)
        
        # 3. Save AI Question
        ai_msg = InterviewMessage(interview_id=interview.id, role="ai", content=next_q_text)
        db.add(ai_msg)
        db.commit()
    else:
        # Reached the end. Save and keep status until complete is called.
        db.commit()

    db.refresh(interview)
    return interview

@router.post("/{interview_id}/complete", response_model=InterviewResponse)
def complete_interview(interview_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
        
    if interview.status == "completed" and interview.evaluation:
        return interview # Already evaluated

    # 1. Generate Evaluation
    transcript = build_chat_transcript(interview.chat_history)
    evaluation_data = generate_interview_evaluation(interview, transcript)
    
    if isinstance(evaluation_data, dict):
        eval_dict = evaluation_data
    else:
        eval_dict = evaluation_data.model_dump()
    
    # Enrich detailed feedback with multidimensional metadata
    enriched_feedback = eval_dict.get("detailed_feedback", [])
    if isinstance(enriched_feedback, list):
        # Attach top-level scoring metadata inside detailed feedback structure for persistence
        meta_dict = {
            "is_meta": True,
            "technical_score": eval_dict.get("technical_score", 7),
            "communication_score": eval_dict.get("communication_score", 7),
            "problem_solving_score": eval_dict.get("problem_solving_score", 7),
            "recommendation": eval_dict.get("recommendation", "Hire"),
            "actionable_remediation": eval_dict.get("actionable_remediation", [])
        }
        enriched_feedback = [meta_dict] + enriched_feedback

    # 2. Save Evaluation to DB
    new_eval = InterviewEvaluation(
        interview_id=interview.id,
        overall_score=eval_dict.get("overall_score", 7),
        strengths=eval_dict.get("strengths", []),
        areas_of_improvement=eval_dict.get("areas_of_improvement", []),
        detailed_feedback=enriched_feedback
    )
    db.add(new_eval)
    
    # 3. Update Interview Status
    interview.status = "completed"
    interview.completed_at = func.now()
    
    db.commit()
    db.refresh(interview)
    
    return interview

@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(interview_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview_query = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id)
    
    if not interview_query.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
        
    interview_query.delete(synchronize_session=False)
    db.commit()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)