import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from schemas.auth import GoogleToken
from sqlalchemy.orm import Session
from db.database import get_db
from services.auth import get_or_create_google_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/google", tags=["Auth - Google"])

@router.post("/verify")
async def verify_google_token(token_data: GoogleToken, response: Response, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        google_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token_data.access_token}"}
        )
    
    if google_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    user_info = google_response.json()
    email = user_info.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email not found in Google profile")

    db_user = get_or_create_google_user(db, email)

    access_token = create_access_token(data={"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False
    )

    return {"message": "Google login successful", "username": db_user.username}