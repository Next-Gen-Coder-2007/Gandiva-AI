from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import os, shutil
from db.database import get_db
from models.user import User
from models.resume import Resume
from services.auth import get_current_user
from services.parser_service import extract_resume_text

router = APIRouter(prefix="/resume", tags=["Resume"])
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate Size (5MB limit)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large")
    await file.seek(0)
    
    # Save File
    file_path = f"{UPLOAD_DIR}/{current_user.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parse Text
    ext = os.path.splitext(file.filename)[1]
    text = extract_resume_text(file_path, ext)
    
    # Save to DB
    resume = Resume(user_id=current_user.id, file_name=file.filename, file_path=file_path, extracted_text=text)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {"message": "Resume uploaded successfully", "resume_id": resume.id, "filename": file.filename, "text_preview": text[:2000]}