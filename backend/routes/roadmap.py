from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from db.database import get_db
from models.roadmap import Roadmap, RoadmapPhase, RoadmapTask
from schemas.roadmap import (
    RoadmapGenerateRequest, RoadmapResponse, TaskStatusUpdate
)
from services.auth import get_current_user
from models.user import User
from services.roadmap import generate_roadmap_with_ai
from typing import List

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

@router.post("", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap(
    payload: RoadmapGenerateRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Optional: Fetch resume context if you have a Resume model.
    # resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    # resume_context = resume.parsed_text if resume else ""
    resume_context = "" # Keeping empty fallback for strict roadmap generation scope
    
    # 1. Call AI Service
    ai_roadmap = generate_roadmap_with_ai(target_role=payload.target_role, resume_context=resume_context)
    
    if hasattr(ai_roadmap, "model_dump"):
        roadmap_data = ai_roadmap.model_dump()
    elif hasattr(ai_roadmap, "dict"):
        roadmap_data = ai_roadmap.dict()
    elif isinstance(ai_roadmap, dict):
        roadmap_data = ai_roadmap
    else:
        roadmap_data = vars(ai_roadmap)

    # 2. Create Base Roadmap
    new_roadmap = Roadmap(
        user_id=current_user.id,
        target_role=payload.target_role,
        current_status=roadmap_data.get("current_status_summary", "")
    )
    db.add(new_roadmap)
    db.flush() # Get roadmap ID

    # 3. Create Phases and Tasks
    phases_list = roadmap_data.get("phases", [])
    for order_idx, phase_data in enumerate(phases_list):
        new_phase = RoadmapPhase(
            roadmap_id=new_roadmap.id,
            title=phase_data.get("title", f"Phase {order_idx + 1}"),
            description=phase_data.get("description", ""),
            estimated_duration=phase_data.get("estimated_duration", ""), # NEW FIELD
            phase_order=order_idx + 1
        )
        db.add(new_phase)
        db.flush()

        tasks_list = phase_data.get("tasks", [])
        for task_data in tasks_list:
            new_task = RoadmapTask(
                phase_id=new_phase.id,
                title=task_data.get("title", "Task"),
                description=task_data.get("description", ""),
                resource_links=task_data.get("resource_links", ""),
                practical_exercise=task_data.get("practical_exercise", ""), # NEW FIELD
                interview_tips=task_data.get("interview_tips", "")          # NEW FIELD
            )
            db.add(new_task)

    db.commit()
    db.refresh(new_roadmap)
    
    return new_roadmap

@router.get("", response_model=List[RoadmapResponse])
def get_user_roadmaps(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Roadmap).filter(Roadmap.user_id == current_user.id).all()

@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.patch("/tasks/{task_id}", status_code=status.HTTP_200_OK)
def update_task_status(
    task_id: int, 
    payload: TaskStatusUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verify task ownership through joins
    task = db.query(RoadmapTask).join(RoadmapPhase).join(Roadmap).filter(
        RoadmapTask.id == task_id,
        Roadmap.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = payload.is_completed
    db.commit()
    
    # Check if all tasks in the phase are completed to auto-complete the phase
    phase = db.query(RoadmapPhase).filter(RoadmapPhase.id == task.phase_id).first()
    all_tasks_completed = all(t.is_completed for t in phase.tasks)
    
    if phase.is_completed != all_tasks_completed:
        phase.is_completed = all_tasks_completed
        db.commit()

    return {"message": "Task updated successfully", "is_completed": task.is_completed}

@router.delete("/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    db.delete(roadmap)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)