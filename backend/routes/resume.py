import io
import PyPDF2
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session, selectinload
from typing import List
from db.database import get_db
from models.resume import Resume as ResumeModel, Skill, Language, Education, Experience, Project, Achievement, Certificate
from schemas.resume import PersonalInfoSchema, Resume, ResumeCreate, ResumeBase, SkillSchema, LanguageSchema, EducationSchema, ExperienceSchema, ProjectSchema, AchievementSchema, CertificateSchema
from services.auth import get_current_user
from services.resume import extract_data_with_gemini
from models.user import User

router = APIRouter(prefix="/resumes", tags=["Resumes"])

def get_resume_or_404(db: Session, resume_id: int, user_id: int):
    resume = db.query(ResumeModel).filter(ResumeModel.id == resume_id, ResumeModel.user_id == user_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found or access denied")
    return resume


@router.post("", response_model=Resume, status_code=status.HTTP_201_CREATED)
def create_resume(resume: ResumeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_resume = ResumeModel(title=resume.title, user_id=current_user.id)
    db.add(db_resume); db.commit(); db.refresh(db_resume)
    return db_resume

@router.get("", response_model=List[Resume])
def get_user_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ResumeModel).filter(ResumeModel.user_id == current_user.id).all()

@router.post("/upload", response_model=Resume, status_code=status.HTTP_201_CREATED)
async def upload_and_parse_resume(title: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="The PDF contains no readable text.")

    parsed_data = extract_data_with_gemini(extracted_text)

    db_resume = ResumeModel(
        user_id=current_user.id,
        title=title,
        profile_summary=parsed_data.get("profile_summary"),
        full_name=parsed_data.get("full_name"),
        email=parsed_data.get("email"),
        phone=parsed_data.get("phone"),
        location=parsed_data.get("location"),
        linkedin=parsed_data.get("linkedin"),
        github=parsed_data.get("github"),
        portfolio=parsed_data.get("portfolio"),
    )
    db.add(db_resume)
    db.flush()

    relations_map = {
        "skills": Skill,
        "languages": Language,
        "educations": Education,
        "experiences": Experience,
        "projects": Project,
        "achievements": Achievement,
        "certificates": Certificate
    }

    for key, model_class in relations_map.items():
        items = parsed_data.get(key, [])
        if items:
            for item in items:
                for date_field in ['start_date', 'end_date', 'issue_date']:
                    if date_field in item and item[date_field]:
                        try:
                            item[date_field] = datetime.strptime(item[date_field], "%Y-%m-%d").date()
                        except ValueError:
                            item[date_field] = None
            db_items = [model_class(**item, resume_id=db_resume.id) for item in items]
            db.add_all(db_items)

    db.commit()
    db.refresh(db_resume)

    complete_resume = db.query(ResumeModel).options(
        selectinload(ResumeModel.skills), 
        selectinload(ResumeModel.languages),
        selectinload(ResumeModel.educations), 
        selectinload(ResumeModel.experiences),
        selectinload(ResumeModel.projects), 
        selectinload(ResumeModel.achievements),
        selectinload(ResumeModel.certificates)
    ).filter(ResumeModel.id == db_resume.id).first()

    return complete_resume

@router.get("/{resume_id}", response_model=Resume)
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(ResumeModel).options(
        selectinload(ResumeModel.skills), selectinload(ResumeModel.languages),
        selectinload(ResumeModel.educations), selectinload(ResumeModel.experiences),
        selectinload(ResumeModel.projects), selectinload(ResumeModel.achievements),
        selectinload(ResumeModel.certificates)
    ).filter(ResumeModel.id == resume_id, ResumeModel.user_id == current_user.id).first()
    if not resume: raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_resume = get_resume_or_404(db, resume_id, current_user.id)
    db.delete(db_resume); db.commit()


def update_section(db: Session, resume_id: int, model_class, data: List[dict]):
    db.query(model_class).filter(model_class.resume_id == resume_id).delete()
    db.add_all([model_class(**item, resume_id=resume_id) for item in data])
    db.commit()

@router.put("/{resume_id}/personal-info", response_model=Resume)
def update_personal_info(resume_id: int, info: PersonalInfoSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_resume = get_resume_or_404(db, resume_id, current_user.id)
    for key, value in info.model_dump().items(): setattr(db_resume, key, value)
    db.commit(); db.refresh(db_resume); return db_resume

@router.put("/{resume_id}/skills", response_model=List[SkillSchema])
def update_skills(resume_id: int, items: List[SkillSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Skill, [s.model_dump() for s in items]); return items

@router.put("/{resume_id}/languages", response_model=List[LanguageSchema])
def update_languages(resume_id: int, items: List[LanguageSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Language, [l.model_dump() for l in items]); return items

@router.put("/{resume_id}/educations", response_model=List[EducationSchema])
def update_educations(resume_id: int, items: List[EducationSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Education, [e.model_dump() for e in items]); return items

@router.put("/{resume_id}/experiences", response_model=List[ExperienceSchema])
def update_experiences(resume_id: int, items: List[ExperienceSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Experience, [e.model_dump() for e in items]); return items

@router.put("/{resume_id}/projects", response_model=List[ProjectSchema])
def update_projects(resume_id: int, items: List[ProjectSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Project, [p.model_dump() for p in items]); return items

@router.put("/{resume_id}/achievements", response_model=List[AchievementSchema])
def update_achievements(resume_id: int, items: List[AchievementSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Achievement, [a.model_dump() for a in items]); return items

@router.put("/{resume_id}/certificates", response_model=List[CertificateSchema])
def update_certificates(resume_id: int, items: List[CertificateSchema], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    get_resume_or_404(db, resume_id, current_user.id)
    update_section(db, resume_id, Certificate, [c.model_dump() for c in items]); return items