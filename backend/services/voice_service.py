import asyncio
import io
import os
from faster_whisper import WhisperModel
import edge_tts

MODEL_SIZE = "base"
print(f"Loading local Speech-to-Text model ({MODEL_SIZE})...")
stt_model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
print("Local STT model loaded successfully.")

async def transcribe_audio_local(audio_bytes: bytes) -> str:
    try:
        audio_stream = io.BytesIO(audio_bytes)
        segments, info = stt_model.transcribe(audio_stream, beam_size=5)
        transcript = "".join([segment.text for segment in segments])
        return transcript.strip()
    except Exception as e:
        print(f"Local STT Error: {e}")
        return ""

async def stream_tts_local(text: str):
    # Switched to a highly clear, professional voice. 
    # Added a slight rate increase (+10%) for a more natural conversational pace.
    voice = "en-US-ChristopherNeural" 
    communicate = edge_tts.Communicate(text, voice, rate="+10%")
    
    audio_data = b""
    try:
        # Buffer the chunks in the backend first. 
        # This prevents the browser from failing to decode partial MP3 headers,
        # which is what causes the static, clipping, and skipping.
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        # Yield the single, perfectly formatted audio file
        if audio_data:
            yield audio_data
            
    except Exception as e:
        print(f"Local TTS Error: {e}")