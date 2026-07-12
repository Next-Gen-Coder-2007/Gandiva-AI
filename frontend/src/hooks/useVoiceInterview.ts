import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInterviewProps {
  sessionId: string | number;
}

export const useVoiceInterview = ({ sessionId }: UseVoiceInterviewProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isThinking, setIsThinking] = useState(false); 
  const [volume, setVolume] = useState(0); 
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const updateVolume = useCallback(() => {
    let currentVolume = 0;
    if (isRecording && micAnalyserRef.current) {
      const dataArray = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
      micAnalyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      currentVolume = Math.min(100, Math.round((avg / 255) * 150)); 
    } else if (isPlaying && playbackAnalyserRef.current) {
      const dataArray = new Uint8Array(playbackAnalyserRef.current.frequencyBinCount);
      playbackAnalyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      currentVolume = Math.min(100, Math.round((avg / 255) * 150));
    }
    setVolume(currentVolume);
    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, [isRecording, isPlaying]);

  useEffect(() => {
    if (isRecording || isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    } else {
      setVolume(0);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, isPlaying, updateVolume]);

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const playbackAnalyser = audioCtx.createAnalyser();
      playbackAnalyser.fftSize = 256;
      playbackAnalyser.connect(audioCtx.destination);
      playbackAnalyserRef.current = playbackAnalyser;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/interviews/ws/${sessionId}/stream`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        startStreaming(stream, audioCtx, ws);
      };

      ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data);
          
          if (msg.type === "STT_PARTIAL") {
            setTranscript(msg.text);
          } else if (msg.type === "STT_FINAL") {
            setTranscript(msg.text);
            setIsThinking(true);
          } else if (msg.type === "AI_TEXT") {
            setAiText(msg.text);
            setIsThinking(false);
          } else if (msg.type === "PROCESSING_START") {
             // New state to bridge the gap while local STT runs
             setIsThinking(true);
             setTranscript("Processing your answer...");
          }
        } else if (event.data instanceof Blob) {
          await playAudioChunk(event.data, audioCtx, playbackAnalyser);
        }
      };

      ws.onclose = () => stopAll();

    } catch (err) {
      setError("Microphone access denied.");
    }
  }, [sessionId]);

  const startStreaming = (stream: MediaStream, audioCtx: AudioContext, ws: WebSocket) => {
    const source = audioCtx.createMediaStreamSource(stream);
    const micAnalyser = audioCtx.createAnalyser();
    micAnalyser.fftSize = 256;
    source.connect(micAnalyser);
    micAnalyserRef.current = micAnalyser;

    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      // Only send bytes if we are actively recording and NOT thinking
      if (ws.readyState === WebSocket.OPEN && isRecording && !isThinking && !isPlaying) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          let s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        ws.send(pcm16.buffer);
      }
    };

    micAnalyser.connect(processor);
    processor.connect(audioCtx.destination);
  };

  const playAudioChunk = async (blob: Blob, audioCtx: AudioContext, analyser: AnalyserNode) => {
    if (!isPlaying) setIsPlaying(true);

    const arrayBuffer = await blob.arrayBuffer();
    try {
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);

      const currentTime = audioCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }
      
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      source.onended = () => {
        if (audioCtx.currentTime >= nextPlayTimeRef.current) {
          setIsPlaying(false);
          setIsRecording(true); // Automatically open the mic after AI finishes
        }
      };
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMute = () => {
    setIsRecording(prev => !prev);
  };

  // --- NEW: Submit Answer Trigger ---
  const submitAnswer = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "CLIENT_SPEECH_DONE" }));
      setIsThinking(true);
    }
  }, []);

  const stopAll = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    if (processorRef.current) processorRef.current.disconnect();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setIsConnected(false);
    setIsRecording(false);
    setIsPlaying(false);
    setIsThinking(false);
  }, []);

  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  return {
    isConnected,
    isRecording,
    isPlaying,
    isThinking,
    volume,
    transcript,
    aiText,
    error,
    connect,
    disconnect: stopAll,
    toggleMute,
    submitAnswer // Export the new function
  };
};