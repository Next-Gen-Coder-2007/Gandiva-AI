from fastapi import APIRouter, Depends, HTTPException, Query
from models.user import User
from services.auth import get_current_user
from services.jobs import get_categories_service, search_jobs_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("/categories")
def get_categories(current_user: User = Depends(get_current_user)):
    data = get_categories_service()
    if not data: raise HTTPException(status_code=502, detail="Categories unavailable")
    return data

@router.get("/")
def search_jobs(query: str = Query(""), category: str = Query(""), location: str = Query("India"), page: int = Query(1),current_user: User = Depends(get_current_user)):
    if not query.strip() and not category.strip():
        raise HTTPException(status_code=400, detail="Query or Category required")
        
    results = search_jobs_service(query, category, location, page)
    if not results: raise HTTPException(status_code=502, detail="Search failed")
    return results