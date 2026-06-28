from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from db.database import get_db
from models.user import User
from schemas.auth import RegisterSchema, LoginSchema
from services.auth import (
    register_local_user, 
    authenticate_local_user, 
    create_access_token, 
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Auth - Local"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterSchema, db: Session = Depends(get_db)):
    register_local_user(db, user)
    return {"message": "Registered successfully"}

@router.post("/login")
def login(user: LoginSchema, response: Response, db: Session = Depends(get_db)):
    db_user = authenticate_local_user(db, user.email, user.password)
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, 
        samesite="lax", 
        secure=False
    )

    return {"message": "Login successful", "username": db_user.username}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", samesite="lax", secure=False)
    return {"message": "Logged out successfully"}

@router.get("/me")
def get_user_details(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }