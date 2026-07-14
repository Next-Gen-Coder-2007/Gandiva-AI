from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# --- API Request/Response Schemas ---

class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., min_length=2, max_length=100)

class RoadmapTaskResponse(BaseModel):
    id: int
    phase_id: int
    title: str
    description: Optional[str] = None
    resource_links: Optional[str] = None
    practical_exercise: Optional[str] = None
    interview_tips: Optional[str] = None
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)

class RoadmapPhaseResponse(BaseModel):
    id: int
    roadmap_id: int
    title: str
    description: Optional[str] = None
    estimated_duration: Optional[str] = None
    phase_order: int
    is_completed: bool
    tasks: List[RoadmapTaskResponse] = []

    model_config = ConfigDict(from_attributes=True)

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    target_role: str
    current_status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    phases: List[RoadmapPhaseResponse] = []

    model_config = ConfigDict(from_attributes=True)

class TaskStatusUpdate(BaseModel):
    is_completed: bool

# --- AI Generation Schemas (For LLM Service) ---

class AIGeneratedTask(BaseModel):
    title: str
    description: str
    resource_links: str = Field(description="Comma-separated list of learning resources or tools")
    practical_exercise: str = Field(description="A specific, actionable mini-project or hands-on task to apply this skill")
    interview_tips: str = Field(description="1 or 2 common interview questions or key concepts related to this task")

class AIGeneratedPhase(BaseModel):
    title: str
    description: str
    estimated_duration: str = Field(description="Realistic timeframe for this phase, e.g., '2 Weeks' or '1 Month'")
    tasks: List[AIGeneratedTask]

class AIGeneratedRoadmap(BaseModel):
    current_status_summary: str = Field(description="A brief summary of the user's current skills vs target role")
    phases: List[AIGeneratedPhase]