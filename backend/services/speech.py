import os
import requests
from typing import Optional

# Cartesia Sonic voice IDs for professional interviewer personas
VOICE_PERSONAS = {
    "alex": {
        "id": "a0e99841-438c-4a64-b679-ae501e7d6091", # Barbershop Man / Natural Professional Male
        "name": "Alex - Principal Engineer",
        "gender": "male"
    },
    "sarah": {
        "id": "79a125e8-cd45-4c13-8a67-188112f4dd22", # Natural Articulate Female
        "name": "Sarah - Senior Tech Recruiter",
        "gender": "female"
    },
    "david": {
        "id": "248be419-c632-4f23-adf1-5324ed7dbf10", # Conversational Male
        "name": "David - Bar Raiser Architect",
        "gender": "male"
    },
    "elena": {
        "id": "694f12bc-c40d-4370-809c-7d052525f669", # Crisp Female
        "name": "Elena - Engineering Director",
        "gender": "female"
    }
}

def synthesize_speech_cartesia(text: str, voice_persona: str = "alex") -> Optional[bytes]:
    api_key = os.getenv("CARTESIA_API_KEY")
    if not api_key:
        return None

    # Sanitize text
    clean_text = text.strip()
    if not clean_text:
        return None

    # Limit text length per question if needed
    if len(clean_text) > 1000:
        clean_text = clean_text[:1000]

    voice_info = VOICE_PERSONAS.get(voice_persona, VOICE_PERSONAS["alex"])
    voice_id = voice_info["id"]

    url = "https://api.cartesia.ai/tts/bytes"
    headers = {
        "X-API-Key": api_key,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model_id": "sonic-english",
        "transcript": clean_text,
        "voice": {
            "mode": "id",
            "id": voice_id
        },
        "output_format": {
            "container": "wav",
            "encoding": "pcm_s16le",
            "sample_rate": 24000
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=12)
        if response.status_code == 200 and response.content:
            return response.content
        else:
            print(f"Cartesia API non-200 response: {response.status_code} - {response.text[:200]}")
            return None
    except Exception as e:
        print(f"Cartesia synthesis error: {e}")
        return None
