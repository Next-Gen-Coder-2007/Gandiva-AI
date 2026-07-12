import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInterviewProps {
  sessionId: string | number;
  onAudioStart?: () => void;
  onAudioStop?: () => void;
}

export const useVoiceInterview = ({ sessionId, onAudioStart, onAudioStop }: UseVoiceInterviewProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // NEW: Thinking state
  const [volume, setVolume] = useState(0); // NEW: Live volume 0-100
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // NEW: Audio Analysers for UI Visuals
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(null);

  const nextPlayTimeRef = useRef<number>(0);

  // --- NEW: Volume Polling Loop ---
  const updateVolume = useCallback(() => {
    let currentVolume = 0;
    
    if (isRecording && micAnalyserRef.current) {
      const dataArray = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
      micAnalyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      currentVolume = Math.min(100, Math.round((avg / 255) * 150)); // Scaled for visibility
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
  // ---------------------------------

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      // Initialize Playback Analyser
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
            setIsThinking(true); // Candidate finished, AI is thinking
          } else if (msg.type === "AI_TEXT") {
            setAiText(msg.text);
            setIsThinking(false); // AI got the answer, stopped thinking
          } else if (msg.type === "TTS_COMPLETE") {
            // Handled automatically when buffer ends
          }
        } else if (event.data instanceof Blob) {
          await playAudioChunk(event.data, audioCtx, playbackAnalyser);
        }
      };

      ws.onerror = () => {
        setError("Connection error. Please try again.");
      };

      ws.onclose = () => {
        setIsConnected(false);
        stopAll();
      };

    } catch (err) {
      console.error("Failed to initialize voice interview", err);
      setError("Microphone access denied or audio system failed.");
    }
  }, [sessionId]);

  const startStreaming = (stream: MediaStream, audioCtx: AudioContext, ws: WebSocket) => {
    const source = audioCtx.createMediaStreamSource(stream);
    
    // Initialize Mic Analyser
    const micAnalyser = audioCtx.createAnalyser();
    micAnalyser.fftSize = 256;
    source.connect(micAnalyser);
    micAnalyserRef.current = micAnalyser;

    const processor = audioCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (ws.readyState === WebSocket.OPEN && isRecording) {
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
    if (!isPlaying) {
      setIsPlaying(true);
      onAudioStart?.();
    }

    const arrayBuffer = await blob.arrayBuffer();
    try {
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to our playback analyser instead of directly to destination
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
          onAudioStop?.();
        }
      };
    } catch (err) {
      console.error("Audio decoding error", err);
    }
  };

  const toggleMute = () => {
    setIsRecording(prev => {
      // If muting, cancel barge-in/thinking just in case
      if (prev) setIsThinking(false);
      return !prev;
    });
  };

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
    return () => {
      stopAll();
    };
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
    toggleMute
  };
};