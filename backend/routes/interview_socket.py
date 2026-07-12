import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from services.interview import generate_next_question
from services.voice_service import transcribe_audio_local, stream_tts_local
from models.interview import InterviewSession, InterviewQuestion

router = APIRouter(prefix="/interviews/ws")

@router.websocket("/{session_id}/stream")
async def interview_stream(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    
    # Session verification
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        await websocket.close(code=1008)
        return

    is_streaming_tts = False
    stop_tts_event = asyncio.Event()
    
    # Audio buffer to collect candidate response chunks
    audio_buffer = bytearray()

    # Local TTS Player Helper
    async def tts_streamer(text: str):
        nonlocal is_streaming_tts
        is_streaming_tts = True
        stop_tts_event.clear()
        
        try:
            async for audio_chunk in stream_tts_local(text):
                if stop_tts_event.is_set():
                    break
                await websocket.send_bytes(audio_chunk)
            await websocket.send_json({"type": "TTS_COMPLETE"})
        finally:
            is_streaming_tts = False

    # Immediate Activation: Play first question automatically upon connection
    latest_question = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id
    ).order_by(InterviewQuestion.order_index.desc()).first()

    if latest_question and not latest_question.answer:
        await websocket.send_json({"type": "AI_TEXT", "text": latest_question.question_text})
        asyncio.create_task(tts_streamer(latest_question.question_text))

    try:
        while True:
            message = await websocket.receive()
            
            # Handle incoming audio bytes from candidate
            if "bytes" in message:
                # If AI is speaking and user interrupts, stop the TTS stream immediately
                if is_streaming_tts:
                    stop_tts_event.set()
                
                # Append arriving chunks to local processing buffer
                audio_buffer.extend(message["bytes"])
                
            # Handle incoming operational control signals from frontend
            elif "text" in message:
                data = json.loads(message["text"])
                
                # Frontend signals candidate has finished speaking
                if data.get("type") == "STOP_RECORDING" or data.get("type") == "CLIENT_SPEECH_DONE":
                    if not audio_buffer:
                        continue
                        
                    await websocket.send_json({"type": "PROCESSING_START"})
                    
                    # 1. Process text via Local Whisper STT Engine
                    raw_bytes = bytes(audio_buffer)
                    audio_buffer.clear() # Reset buffer for next question
                    
                    transcript = await transcribe_audio_local(raw_bytes)
                    
                    if not transcript:
                        await websocket.send_json({"type": "AI_TEXT", "text": "I didn't quite catch that. Could you please repeat?"})
                        await tts_streamer("I didn't quite catch that. Could you please repeat?")
                        continue

                    # Update frontend display with the transcribed text
                    await websocket.send_json({"type": "STT_FINAL", "text": transcript})
                    
                    # 2. Rebuild conversational history context mapping
                    qa_history = []
                    for q in session.questions:
                        if q.answer:
                            qa_history.append({"question": q.question_text, "answer": q.answer})
                    
                    if not qa_history:
                        qa_history.append({"question": "Initial introduction", "answer": transcript})
                    
                    # 3. Request LLM Engine for target adaptive next question
                    db.refresh(session)
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
                    
                    # 4. Stream response to frontend
                    await websocket.send_json({"type": "AI_TEXT", "text": next_q.question_text})
                    await tts_streamer(next_q.question_text)

                elif data.get("type") == "STOP_AUDIO":
                    stop_tts_event.set()

    except WebSocketDisconnect:
        print(f"Session {session_id} connection closed.")
    except Exception as e:
        print(f"WebSocket Loop Error: {e}")