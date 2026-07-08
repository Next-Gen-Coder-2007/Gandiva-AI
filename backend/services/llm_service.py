import os
import json
from google import genai
from google.genai import types

def gemini_service(prompt: str, schema: any) -> dict:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.1,
        ),
    )
    
    if response.parsed:
        return response.parsed.model_dump()
        
    if response.text and response.text.strip() != "null":
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            raise ValueError("The AI model returned malformed JSON text.")
            
    raise ValueError("The AI model returned an empty response. Verify safety filters or API limits.")