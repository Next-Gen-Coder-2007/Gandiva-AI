from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from typing import List
from db.database import get_db
from models.user import User
from services.auth import get_current_user
from models.interview import InterviewSession, InterviewQuestion, InterviewAnswer, InterviewEvaluation, InterviewFeedback, InterviewHistory
from schemas.interview import InterviewCreate, InterviewSessionResponse, InterviewAnswerSubmit, InterviewEvaluationResponse
from services.interview import generate_interview_questions, evaluate_interview_answers

router = APIRouter(prefix="/interviews", tags=["Interviews"])

def get_session_or_404(db: Session, session_id: int, user_id: int):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found or access denied")
    return session


@router.post("/create", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
def create_interview(data: InterviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Create the session
    db_session = InterviewSession(
        user_id=current_user.id,
        role=data.role,
        experience=data.experience,
        difficulty=data.difficulty,
        interview_type=data.interview_type,
        duration=data.duration,
        num_questions=data.num_questions,
        skills=data.skills,
        company=data.company,
        status="pending"
    )
    db.add(db_session)
    db.flush() 
    
    # 2. Generate questions via AI
    ai_questions = generate_interview_questions(
        role=data.role, experience=data.experience, difficulty=data.difficulty, 
        num_questions=data.num_questions, skills=data.skills, company=data.company
    )
    
    # 3. Safely extract the list of questions (handles both dict and Pydantic object)
    questions_list = ai_questions.get("questions", []) if isinstance(ai_questions, dict) else ai_questions.questions
    
    # 4. Save questions to DB
    db_questions = []
    for idx, q in enumerate(questions_list):
        # Handle individual questions as dicts or objects
        q_text = q.get("question_text") if isinstance(q, dict) else q.question_text
        q_category = q.get("category", "General") if isinstance(q, dict) else q.category
        
        db_questions.append(
            InterviewQuestion(
                session_id=db_session.id,
                question_text=q_text,
                category=q_category,
                order_index=idx
            )
        )
        
    db.add_all(db_questions)
    db.commit()
    db.refresh(db_session)
    
    # Fetch with loaded questions
    return db.query(InterviewSession).options(selectinload(InterviewSession.questions)).filter(InterviewSession.id == db_session.id).first()

@router.get("", response_model=List[InterviewSessionResponse])
def get_user_interviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InterviewSession).options(
        selectinload(InterviewSession.evaluation)
    ).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc()).all()


@router.get("/{session_id}", response_model=InterviewSessionResponse)
def get_interview(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(InterviewSession).options(
        selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer),
        selectinload(InterviewSession.evaluation).selectinload(InterviewEvaluation.feedback)
    ).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview not found")
    return session


@router.post("/{session_id}/start", status_code=status.HTTP_200_OK)
def start_interview(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_session = get_session_or_404(db, session_id, current_user.id)
    db_session.status = "in_progress"
    db.commit()
    return {"message": "Interview started"}


@router.post("/question/{question_id}/answer", status_code=status.HTTP_201_CREATED)
def submit_answer(question_id: int, data: InterviewAnswerSubmit, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    question = db.query(InterviewQuestion).join(InterviewSession).filter(
        InterviewQuestion.id == question_id, InterviewSession.user_id == current_user.id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    db_answer = InterviewAnswer(
        question_id=question_id,
        answer_text=data.answer_text,
        time_taken=data.time_taken
    )
    db.add(db_answer)
    db.commit()
    return {"message": "Answer saved successfully"}


@router.post("/{session_id}/evaluate", response_model=InterviewEvaluationResponse)
def evaluate_interview(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_session = db.query(InterviewSession).options(
        selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer)
    ).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Compile Q&A pairs for the AI
    qa_pairs = []
    for q in db_session.questions:
        if q.answer:
            qa_pairs.append({"question": q.question_text, "answer": q.answer.answer_text})
        else:
            qa_pairs.append({"question": q.question_text, "answer": "[Candidate skipped or did not answer]"})
            
    # Trigger AI Evaluation
    ai_eval = evaluate_interview_answers(
        qa_pairs=qa_pairs, 
        role=db_session.role, 
        experience=db_session.experience
    )
    
    # Helper to safely extract values from dict or Pydantic object
    def get_val(key, default=0.0):
        if isinstance(ai_eval, dict):
            return ai_eval.get(key, default)
        return getattr(ai_eval, key, default)
    
    # Save Evaluation
    db_eval = InterviewEvaluation(
        session_id=session_id,
        communication_score=get_val("communication_score", 0.0),
        technical_score=get_val("technical_score", 0.0),
        confidence_score=get_val("confidence_score", 0.0),
        problem_solving_score=get_val("problem_solving_score", 0.0),
        accuracy_score=get_val("accuracy_score", 0.0),
        grammar_score=get_val("grammar_score", 0.0),
        completeness_score=get_val("completeness_score", 0.0),
        overall_score=get_val("overall_score", 0.0),
        detailed_explanation=get_val("detailed_explanation", "No explanation provided.")
    )
    db.add(db_eval)
    db.flush()
    
    # Save Feedback
    db_feedback = InterviewFeedback(
        evaluation_id=db_eval.id,
        strengths=get_val("strengths", []),
        weaknesses=get_val("weaknesses", []),
        improvement_suggestions=get_val("improvement_suggestions", []),
        learning_resources=get_val("learning_resources", []),
        recommended_roadmap=get_val("recommended_roadmap", ""),
        recommended_quizzes=get_val("recommended_quizzes", []),
        recommended_interview=get_val("recommended_interview", "")
    )
    db.add(db_feedback)
    
    db_session.status = "completed"
    
    # Create History Record
    db_history = InterviewHistory(
        session_id=session_id,
        user_id=current_user.id,
        report_summary=f"Score: {db_eval.overall_score}/10. {db_eval.detailed_explanation[:100]}..."
    )
    db.add(db_history)
    
    db.commit()
    db.refresh(db_eval)
    
    # Fetch complete evaluation block to return
    return db.query(InterviewEvaluation).options(selectinload(InterviewEvaluation.feedback)).filter(InterviewEvaluation.id == db_eval.id).first()

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_session = get_session_or_404(db, session_id, current_user.id)
    db.delete(db_session)
    db.commit()