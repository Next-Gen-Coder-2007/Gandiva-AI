from typing import Optional
from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class GoogleToken(BaseModel):
    access_token: str

class ForgotPasswordSchema(BaseModel):
    email: EmailStr

class VerifyOtpSchema(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class ChangePasswordSchema(BaseModel):
    new_password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    interview_tone_preference: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[float] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    interview_tone_preference: Optional[str] = "Encouraging & Helpful"

    class Config:
        from_attributes = True