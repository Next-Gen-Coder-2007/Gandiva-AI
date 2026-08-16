from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from models.user import User
from services.auth import get_current_user
from services.jobs import get_categories_service, search_jobs_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/categories")
def get_categories(current_user: User = Depends(get_current_user)):
    data = get_categories_service()
    if not data:
        raise HTTPException(status_code=502, detail="Categories unavailable")
    return data

@router.get("/")
def search_jobs(
    query: str = Query("", description="Job title, company, or keyword"),
    category: str = Query("", description="Category tag or label"),
    location: str = Query("India", description="Location or country"),
    work_mode: str = Query("All", description="Work mode: All, Remote, Hybrid, On-site"),
    experience_level: str = Query("All", description="Experience level: All, Internship, Entry Level, Mid Level"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    results = search_jobs_service(
        query=query, 
        category=category, 
        location=location,
        work_mode=work_mode,
        experience_level=experience_level,
        page=page,
        limit=limit
    )
    return results