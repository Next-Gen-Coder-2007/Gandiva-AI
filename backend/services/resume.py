from fastapi import HTTPException
from schemas.resume import ParsedResumeData
import os
from google import genai
from google.genai import types

def extract_data_with_gemini(text: str):
    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY")
    )
    
    prompt = f"""
    You are an expert resume parser. Extract all relevant information from the following resume text.
    Map the extracted data strictly to the provided JSON schema.
    If a specific piece of information (like a GitHub link or a specific date) is missing, leave it as null or omit it.
    
    Resume Text:
    {text}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ParsedResumeData,
                temperature=0.1,
            ),
        )
        import json
        return json.loads(response.text)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Parsing failed: {str(e)}")