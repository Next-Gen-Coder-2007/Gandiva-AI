import asyncio
import json
import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from services.interview import generate_next_question
from services.voice_service import get_deepgram_ws_url, get_deepgram_headers, stream_tts_cartesia
from models.interview import InterviewSession, InterviewAnswer

router = APIRouter(prefix="/interviews/ws")

@router.websocket("/{session_id}/stream")
async def interview_stream(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    
    # Session verification
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        await websocket.close(code=1008)
        return

    # Connection state
    is_streaming_tts = False
    stop_tts_event = asyncio.Event()

    async def tts_streamer(text: str):
        nonlocal is_streaming_tts
        is_streaming_tts = True
        stop_tts_event.clear()
        
        try:
            async for audio_chunk in stream_tts_cartesia(text):
                if stop_tts_event.is_set():
                    break
                await websocket.send_bytes(audio_chunk)
            await websocket.send_json({"type": "TTS_COMPLETE"})
        finally:
            is_streaming_tts = False

    try:
        # Connect to Deepgram STT
        async with websockets.connect(get_deepgram_ws_url(), additional_headers=get_deepgram_headers()) as dg_ws:
            
            async def send_to_dg():
                while True:
                    data = await websocket.receive_bytes()
                    # If candidate speaks (barge-in), signal to stop TTS
                    if is_streaming_tts:
                        stop_tts_event.set()
                    await dg_ws.send(data)

            async def receive_from_dg():
                full_transcript = ""
                async for msg in dg_ws:
                    res = json.loads(msg)
                    transcript = res.get("channel", {}).get("alternatives", [{}])[0].get("transcript", "")
                    
                    if transcript:
                        full_transcript += transcript
                        await websocket.send_json({"type": "STT_PARTIAL", "text": transcript})
                    
                    # End of Utterance detection
                    if res.get("speech_final"):
                        # Process answer
                        # 1. Save to DB
                        # 2. Trigger Next Question Logic
                        # 3. Stream back
                        await websocket.send_json({"type": "STT_FINAL", "text": full_transcript})
                        
                        # Logic: Get next question
                        qa_history = [{"question": "...", "answer": full_transcript}] # Simplified; in prod use actual history
                        
                        next_q = generate_next_question(
                            role=session.role, 
                            experience=session.experience,
                            difficulty=session.difficulty,
                            skills=session.skills,
                            company=session.company,
                            qa_history=qa_history,
                            current_q_number=len(session.questions) + 1,
                            total_questions=session.num_questions,
                            resume_text=session.resume_text,
                            job_description=session.job_description
                        )
                        
                        await websocket.send_json({"type": "AI_TEXT", "text": next_q.question_text})
                        await tts_streamer(next_q.question_text)
                        full_transcript = ""

            await asyncio.gather(send_to_dg(), receive_from_dg())

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WS Error: {e}")