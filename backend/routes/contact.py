import os
import httpx
from schemas.contact import ContactForm
from fastapi import APIRouter, HTTPException, Response
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post('')
async def send_contact_email(form_data: ContactForm):    
    payload = {
        "service_id": os.getenv("EMAILJS_SERVICE_ID"),
        "template_id": os.getenv("EMAILJS_TEMPLATE_ID"),
        "user_id": os.getenv("EMAILJS_PUBLIC_KEY"),
        'accessToken': os.getenv('EMAILJS_PRIVATE_KEY'),
        "template_params": {
            "from_name": form_data.name,
            "reply_to": form_data.email,
            "message": form_data.message
        }
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(os.getenv("EMAILJS_URL"), json=payload,headers={"Content-Type": "application/json"})
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=response.text)
            
    return {"message": "Email sent successfully"}