from pydantic import BaseModel

class ResumeBase(BaseModel):
    title: str

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True