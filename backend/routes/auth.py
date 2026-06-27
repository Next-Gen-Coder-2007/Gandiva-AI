import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError

from db.database import get_db
from models.user import User
from schemas.auth import RegisterSchema, LoginSchema

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token_cookie = request.cookies.get("access_token")
    
    if not token_cookie:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Authentication cookie missing. Please log in."
        )
    
    token = token_cookie.replace("Bearer ", "") if "Bearer " in token_cookie else token_cookie

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token payload invalid."
            )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token has expired. Please log in again."
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication token."
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User associated with this token no longer exists."
        )
        
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        or_(User.email == user.email, User.username == user.username)
    ).first()

    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Username is already taken"
            )
        if existing_user.email == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A user with these credentials already exists."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An error occurred while creating the user."
        )

    return {"message": "Registered successfully"}

@router.post("/login")
def login(user: LoginSchema, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    invalid_credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Invalid email or password"
    )

    if not db_user or not verify_password(user.password, db_user.password):
        raise invalid_credentials_exception

    access_token = create_access_token(data={"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, 
        samesite="lax", 
        secure=False
    )

    return {
        "message": "Login successful",
        "username": db_user.username
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        samesite="lax",
        secure=False
    )
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_user_details(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }