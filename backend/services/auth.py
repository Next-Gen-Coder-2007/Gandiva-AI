import os
import random
import secrets
from datetime import datetime, timedelta
from cachetools import TTLCache 
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError

from db.database import get_db
from models.user import User
from schemas.auth import RegisterSchema

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
otp_cache = TTLCache(maxsize=1000, ttl=600)

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication cookie missing.")
    
    token = token_cookie.replace("Bearer ", "") if "Bearer " in token_cookie else token_cookie

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token payload invalid.")
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    return user

def register_local_user(db: Session, user: RegisterSchema):
    existing_user = db.query(User).filter(
        or_(User.email == user.email, User.username == user.username)
    ).first()

    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(status_code=400, detail="Username is already taken")
        if existing_user.email == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="A user with these credentials already exists.")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating user.")

def authenticate_local_user(db: Session, email, password):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user or not verify_password(password, db_user.password):
        return None
    return db_user

def get_or_create_google_user(db: Session, email: str):
    db_user = db.query(User).filter(User.email == email).first()
    
    if not db_user:
        random_password = secrets.token_urlsafe(32)
        db_user = User(
            username=email.split("@")[0],
            email=email,
            password=hash_password(random_password) 
        )
        try:
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Error creating Google user account.")
            
    return db_user

def generate_and_save_otp(db: Session, email: str) -> str:
    otp = str(random.randint(100000, 999999))
    otp_cache[email] = otp
    return otp

def check_otp_validity(db: Session, email: str, otp: str) -> bool:
    stored_otp = otp_cache.get(email)
    return stored_otp is not None and stored_otp == otp

def verify_otp_and_update_password(db: Session, email: str, otp: str, new_password: str) -> bool:
    if not check_otp_validity(db, email, otp):
        return False
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
        
    user.password = hash_password(new_password)
    db.commit()
    
    if email in otp_cache:
        del otp_cache[email]
        
    return True