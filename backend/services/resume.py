from fastapi import HTTPException
from schemas.resume import ParsedResumeData
from services.llm_service import gemini_service

def extract_data_with_gemini(text: str):
    
    prompt = f"""
    You are an expert resume parser. Extract all relevant information from the following resume text.
    Map the extracted data strictly to the provided JSON schema.
    If a specific piece of information (like a GitHub link or a specific date) is missing, leave it as null or omit it.
    
    Resume Text:
    {text}
    """

    try:
        return gemini_service(prompt, ParsedResumeData)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Parsing failed: {str(e)}")

def enhance_resume_text_with_gemini(text: str, section_type: str = "bullet", role: str = None) -> dict:
    role_ctx = f"for a {role} position" if role else "for top tech roles"
    
    if section_type == "summary":
        prompt = (
            f"You are a top Silicon Valley resume writer and technical recruiter. "
            f"Rewrite the following professional summary {role_ctx} to make it impactful, concise (3-4 sentences), "
            f"ATS-optimized, and highlighting strong value proposition, technical expertise, and leadership.\n\n"
            f"Original Summary:\n\"\"\"{text}\"\"\"\n\n"
            f"Return a strict JSON with 'original_text', 'enhanced_text', and 'improvement_notes'."
        )
    else:
        prompt = (
            f"You are a top Silicon Valley resume coach. "
            f"Rewrite and elevate the following resume bullet point/description {role_ctx}. "
            f"Use the Google XYZ Formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. "
            f"Start with a strong action verb, quantify impact where appropriate, and ensure high ATS keyword density.\n\n"
            f"Original Text:\n\"\"\"{text}\"\"\"\n\n"
            f"Return a strict JSON with 'original_text', 'enhanced_text', and 'improvement_notes'."
        )

    from schemas.resume import EnhancedTextResponse
    try:
        return gemini_service(prompt, EnhancedTextResponse)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Enhancement failed: {str(e)}")