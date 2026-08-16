from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

import os, httpx
from db.database import get_db
from models.user import User
from schemas.auth import (
    ChangePasswordSchema, RegisterSchema, LoginSchema, ForgotPasswordSchema, 
    VerifyOtpSchema, ResetPasswordSchema, UserProfileUpdate, UserProfileResponse
)
from services.auth import (
    hash_password,
    register_local_user, 
    authenticate_local_user, 
    create_access_token, 
    get_current_user,
    generate_and_save_otp,
    check_otp_validity,
    verify_otp_and_update_password,
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

@router.get("/me", response_model=UserProfileResponse)
def get_user_details(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile_data: UserProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return {"message": "If an account exists, an OTP has been sent."}

    otp = generate_and_save_otp(payload.email)

    email_payload = {
        "service_id": os.getenv("EMAILJS_SERVICE_ID"),
        "template_id": os.getenv("EMAILJS_OTP_TEMPLATE_ID"),
        "user_id": os.getenv("EMAILJS_PUBLIC_KEY"),
        "accessToken": os.getenv("EMAILJS_PRIVATE_KEY"),
        "template_params": {
            "email": user.email,
            "passcode": otp,
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            os.getenv("EMAILJS_URL"), 
            json=email_payload,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpSchema, db: Session = Depends(get_db)):
    is_valid = check_otp_validity(payload.email, payload.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired OTP"
        )
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordSchema, db: Session = Depends(get_db)):
    is_reset = verify_otp_and_update_password(
        db, email=payload.email, otp=payload.otp, new_password=payload.new_password
    )
    if not is_reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or expired OTP"
        )
    return {"message": "Password reset successfully"}

@router.post("/change-password")
def change_password(payload: ChangePasswordSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    current_user.password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password changed successfully"}