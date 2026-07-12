import os
import json
import httpx
from fastapi import HTTPException
from typing import AsyncGenerator

# Ensure you add these to your .env file
CARTESIA_API_KEY = os.getenv("CARTESIA_API_KEY", "your_cartesia_api_key_here")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "your_deepgram_api_key_here")

# A professional, clear conversational voice ID from Cartesia
DEFAULT_VOICE_ID = "a0e99841-438c-4a64-b6a9-ae0f1726ff8e" 

async def stream_tts_cartesia(text: str, voice_id: str = DEFAULT_VOICE_ID) -> AsyncGenerator[bytes, None]:
    """
    Streams audio bytes from Cartesia TTS based on the provided text.
    Uses httpx to stream raw PCM audio chunks in real-time.
    """
    if not text or not text.strip():
        return

    url = "https://api.cartesia.ai/tts/bytes"
    headers = {
        "X-API-Key": CARTESIA_API_KEY,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json"
    }
    
    # We request raw PCM 16-bit, 16kHz audio which is standard for WebSockets and WebAudio API
    payload = {
        "model_id": "sonic-english",
        "transcript": text,
        "voice": {
            "mode": "id",
            "id": voice_id
        },
        "output_format": {
            "container": "raw",
            "encoding": "pcm_s16le",
            "sample_rate": 16000
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", url, headers=headers, json=payload, timeout=15.0) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"Cartesia Error [{response.status_code}]: {error_text}")
                    return

                # Yield audio chunks as they arrive for immediate playback
                async for chunk in response.aiter_bytes(chunk_size=1024):
                    if chunk:
                        yield chunk
                        
        except httpx.RequestError as e:
            print(f"Cartesia HTTP Request Error: {str(e)}")
            return
        except Exception as e:
            print(f"Cartesia Streaming Error: {str(e)}")
            return


def get_deepgram_ws_url() -> str:
    """
    Returns the Deepgram WebSocket URL configured for real-time transcription.
    - endpointing: Detects silence (in ms) to know when the candidate finishes speaking.
    - interim_results: Streams partial words for live UI transcripts.
    - smart_format: Applies punctuation and capitalization automatically.
    """
    return (
        "wss://api.deepgram.com/v1/listen?"
        "encoding=linear16&sample_rate=16000&channels=1"
        "&model=nova-2&smart_format=true"
        "&endpointing=500" # 500ms of silence triggers the end of an utterance
        "&interim_results=true"
    )

def get_deepgram_headers() -> dict:
    """
    Returns the required headers for Deepgram WebSocket connection.
    """
    return {
        "Authorization": f"Token {DEEPGRAM_API_KEY}"
    }