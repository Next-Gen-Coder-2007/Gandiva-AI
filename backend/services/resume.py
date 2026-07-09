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