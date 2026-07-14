from fastapi import HTTPException
from schemas.roadmap import AIGeneratedRoadmap
from services.llm_service import gemini_service

def generate_roadmap_with_ai(target_role: str, resume_context: str = "") -> AIGeneratedRoadmap:
    context_block = ""
    if resume_context:
        context_block = (
            f"Here is the user's current resume/profile context:\n"
            f"{resume_context}\n\n"
            f"Please identify the skill gaps between their current context and the {target_role} role."
        )
    else:
        context_block = "The user has not provided a resume. Build a comprehensive roadmap from a beginner/intermediate perspective."

    prompt = (
        f"You are an expert AI Career Coach and Senior Technical Interviewer. "
        f"Create a highly structured, intensely detailed, step-by-step learning roadmap for a user who wants to become a '{target_role}'.\n\n"
        f"{context_block}\n\n"
        f"Divide the learning path into 3 to 5 logical phases (e.g., 'Core Fundamentals', 'System Design').\n"
        f"For each Phase:\n"
        f"- Provide a realistic 'estimated_duration'.\n"
        f"- Outline specific, actionable tasks.\n\n"
        f"For each Task:\n"
        f"- Describe the objective clearly.\n"
        f"- Suggest 1-2 exact resource types (e.g., 'React Docs, freeCodeCamp').\n"
        f"- Provide a 'practical_exercise' (a mini-project or code implementation to prove they learned it).\n"
        f"- Provide 'interview_tips' (What questions will recruiters ask about this specific concept?).\n\n"
        f"You must return the response as a strict JSON object matching the provided schema exactly."
    )

    try:
        return gemini_service(prompt, AIGeneratedRoadmap)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Roadmap generation failed: {str(e)}"
        )