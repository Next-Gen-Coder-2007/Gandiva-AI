from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.resume import Resume as ResumeModel
from schemas.resume import Resume, ResumeCreate
from services.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("", response_model=Resume, status_code=status.HTTP_201_CREATED)
def create_resume(resume: ResumeCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    db_resume = ResumeModel(name=resume.name, user_id=current_user.id)
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.get("", response_model=List[Resume])
def get_user_resumes(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return db.query(ResumeModel).filter(ResumeModel.user_id == current_user.id).all()