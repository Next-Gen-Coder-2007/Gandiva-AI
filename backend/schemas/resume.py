from pydantic import BaseModel
from typing import Optional

class ResumeResponse(BaseModel):
    message: str
    resume_id: int
    filename: str
    text_preview: str

    class Config:
        from_attributes = True