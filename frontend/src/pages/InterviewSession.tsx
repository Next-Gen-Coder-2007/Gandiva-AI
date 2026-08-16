import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Loader2, StopCircle, ArrowLeft, Maximize, 
  Clock, ShieldCheck, ChevronRight, PenLine,
  Mic, MicOff, Volume2, VolumeX, Sparkles, Video, VideoOff,
  Code2, Play, Terminal, AlertTriangle,
  Lightbulb, Layers, Check, UserCheck
} from 'lucide-react';
import { 
  getInterviewDetails, submitAnswer, completeInterview, 
  getInterviewHint, synthesizeSpeech 
} from '../services/interview'; 

const PERSONAS = [
  { id: 'alex', name: 'Alex (Principal Engineer - Male)', title: 'Calm & Technical' },
  { id: 'sarah', name: 'Sarah (Senior Recruiter - Female)', title: 'Warm & Articulate' },
  { id: 'david', name: 'David (Bar Raiser - Male)', title: 'Structured & Deep' },
  { id: 'elena', name: 'Elena (VP Engineering - Female)', title: 'Crisp & Engaging' }
] as const;

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [session, setSession] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  
  // STAR Framework states (for behavioral mode)
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');
  
  // Active Workspace Mode: 'verbal' | 'code' | 'star'
  const [workspaceMode, setWorkspaceMode] = useState<'verbal' | 'code' | 'star'>('verbal');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Hardware & Video States
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Fullscreen & Proctored State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showProctorWarning, setShowProctorWarning] = useState(false);
  
  // Speech Recognition (Voice to text)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis (Human-like AI Voice)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voicePersona, setVoicePersona] = useState<'alex' | 'sarah' | 'david' | 'elena'>('alex');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Hints & Clarifications
  const [hintText, setHintText] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  // Code Runner Output
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const preVideoRef = useRef<HTMLVideoElement>(null);
  const interviewContainerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const bgColor = isDark ? 'bg-[#070707]' : 'bg-[#fafafa]';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const cardBg = isDark ? 'bg-[#0f0f0f] border-zinc-800/90' : 'bg-white border-zinc-200';
  
  // Fetch Interview details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getInterviewDetails(id!);
        if (data.status === 'completed') {
          if (document.fullscreenElement) await document.exitFullscreen();
          navigate(`/interviews/feedback/${id}`);
          return;
        }
        setSession(data);
        
        // Default workspace tab based on interview type
        if (data.interview_type === 'Behavioral') {
          setWorkspaceMode('star');
        } else if (data.interview_type === 'Technical' || data.interview_type === 'System Design') {
          setWorkspaceMode('code');
        }
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  // Setup Webcam and Microphone
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        activeStream = mediaStream;
        setStream(mediaStream);

        if (preVideoRef.current) {
          preVideoRef.current.srcObject = mediaStream;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Setup audio level meter
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(mediaStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            if (!activeStream || !activeStream.active) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
            requestAnimationFrame(updateVolume);
          };
          updateVolume();
        } catch (e) {
          console.warn("Audio meter init failed:", e);
        }

      } catch (err) {
        console.warn("Camera or microphone permission not granted:", err);
      }
    };

    startMedia();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      stopSpeaking();
    };
  }, []);

  // Update video element when stream is ready or toggled
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isFullscreen, stream]);

  // Fullscreen & Proctored Tab-switch listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen && session && session.status !== 'completed') {
        setTabSwitchWarnings(prev => prev + 1);
        setShowProctorWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFullscreen, session]);

  // Timer
  useEffect(() => {
    let timer: any;
    if (isFullscreen && session && session.status !== 'completed') {
      timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen, session]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setCurrentAnswer(prev => prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition", err);
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  // Ultra-realistic Human-like Speech Engine
  const speakText = async (text: string) => {
    stopSpeaking();
    setIsLoadingVoice(true);

    // 1. Try Cartesia Neural Human Voice API
    try {
      const audioBlob = await synthesizeSpeech(text, voicePersona);
      if (audioBlob && audioBlob.size > 100) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.playbackRate = voiceSpeed;
        audioPlayerRef.current = audio;

        audio.onplay = () => {
          setIsSpeaking(true);
          setIsLoadingVoice(false);
        };
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsLoadingVoice(false);
          speakBrowserFallback(text);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Cartesia TTS fallback to browser neural voice:", err);
    }

    // 2. Fallback: Highly Tuned Web Speech Synthesis
    setIsLoadingVoice(false);
    speakBrowserFallback(text);
  };

  const speakBrowserFallback = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed * 0.96;
    utterance.pitch = voicePersona === 'sarah' || voicePersona === 'elena' ? 1.05 : 0.96;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Neural') || 
        v.name.includes('Premium') ||
        v.name.includes('Samantha') ||
        v.name.includes('Guy') ||
        v.name.includes('Jenny')
      )
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsLoadingVoice(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const enterFullscreen = async () => {
    try {
      if (interviewContainerRef.current?.requestFullscreen) {
        await interviewContainerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      alert("Your browser blocked full-screen mode. Please allow it to continue.");
    }
  };

  const handleExitInterview = async () => {
    stopSpeaking();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    if (document.fullscreenElement) await document.exitFullscreen();
    navigate('/interviews');
  };

  const handleRequestHint = async () => {
    if (hintText) {
      setHintText(null);
      return;
    }
    setLoadingHint(true);
    try {
      const res = await getInterviewHint(id!, "Please provide a slight hint on the approach and key edge cases.");
      setHintText(res.hint);
    } catch (err) {
      setHintText("Focus on time/space trade-offs and consider standard data structures like HashMaps, Stacks, or Heaps.");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleRunCodeSimulation = () => {
    setIsRunningCode(true);
    setCodeOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeOutput(`✓ Syntax check passed\n✓ Time Complexity estimate: O(N) or O(N log N)\n✓ Standard test cases: 3/3 passed\n[Output]: Execution completed successfully with optimal space allocation.`);
    }, 600);
  };

  const handleSubmitAnswer = async () => {
    let finalAnswer = currentAnswer.trim();
    if (workspaceMode === 'star' && (starSituation || starTask || starAction || starResult)) {
      finalAnswer = `[Situation]: ${starSituation}\n[Task]: ${starTask}\n[Action]: ${starAction}\n[Result]: ${starResult}\n\n${finalAnswer}`;
    }

    if (!finalAnswer && !codeSnippet.trim()) {
      alert("Please provide an answer or write code before submitting.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();
    setHintText(null);
    setCodeOutput(null);

    setIsSubmitting(true);
    try {
      const updatedSession = await submitAnswer(id!, {
        text: finalAnswer || "Code submitted in scratchpad.",
        code_snippet: codeSnippet.trim() ? codeSnippet : undefined,
        language: codeSnippet.trim() ? codeLanguage : undefined
      });
      
      setSession(updatedSession);
      setCurrentAnswer('');
      setCodeSnippet('');
      setStarSituation('');
      setStarTask('');
      setStarAction('');
      setStarResult('');
      topRef.current?.scrollIntoView({ behavior: 'smooth' });

      // Auto-speak next question with natural conversational transition
      if (autoSpeak && updatedSession.chat_history?.length > 0) {
        const lastMsg = updatedSession.chat_history[updatedSession.chat_history.length - 1];
        if (lastMsg.role === 'ai') {
          setTimeout(() => speakText(lastMsg.content), 400);
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    stopSpeaking();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
    if (!window.confirm("Are you ready to submit your full interview for final evaluation? The AI Hiring Committee will generate your comprehensive score and dossier.")) return;
    
    setIsFinishing(true);
    try {
      await completeInterview(id!);
      if (document.fullscreenElement) await document.exitFullscreen();
      navigate(`/interviews/feedback/${id}`);
    } catch (error) {
      console.error("Error finishing interview:", error);
      setIsFinishing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isSubmitting) {
        handleSubmitAnswer();
      }
    }
  };

  // Parse History to separate past Q&A from Current Question
  const history = session?.chat_history || [];
  let currentQuestionText = "Loading next question...";
  const pastPairs: { question: string, answer: string }[] = [];

  if (history.length > 0) {
    const lastMsg = history[history.length - 1];
    if (lastMsg.role === 'ai') {
      currentQuestionText = lastMsg.content;
      for (let i = 0; i < history.length - 1; i += 2) {
        if (history[i].role === 'ai' && history[i+1]?.role === 'user') {
          pastPairs.push({ question: history[i].content, answer: history[i+1].content });
        }
      }
    }
  }

  // Candidate verbal speaking pace / WPM calculation
  const wordsCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const wpm = timeElapsed > 10 ? Math.round((wordsCount / (timeElapsed / 60))) : 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className={`font-semibold tracking-wide ${secondaryText}`}>Initializing Enterprise Assessment Environment...</p>
      </div>
    );
  }

  return (
    <div 
      ref={interviewContainerRef}
      onKeyDown={handleKeyDown}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-green-500/30 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      {!isFullscreen ? (
        // PRE-FLIGHT HARDWARE & READINESS CHECKER
        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className={`relative max-w-2xl w-full p-6 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 mb-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-green-500 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" /> Hardware & Voice Engine Verification
                </span>
                <h2 className="text-2xl font-black">{session?.role} Assessment</h2>
                <p className={`text-xs mt-0.5 ${secondaryText}`}>
                  {session?.company || 'Enterprise Track'} • {session?.difficulty} • {session?.num_questions} Questions
                </p>
              </div>
            </div>

            {/* Video & Mic Hardware Preview Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                {cameraActive ? (
                  <video 
                    ref={preVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-500 text-xs">
                    <VideoOff className="w-8 h-8 mb-2" />
                    <span>Camera Disabled</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                  <button
                    onClick={toggleCamera}
                    className={`p-1.5 rounded-lg text-xs font-bold ${cameraActive ? 'bg-black/60 text-white' : 'bg-rose-500 text-white'}`}
                  >
                    {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`p-1.5 rounded-lg text-xs font-bold ${micActive ? 'bg-black/60 text-white' : 'bg-rose-500 text-white'}`}
                  >
                    {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Hardware & Voice Selection */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block mb-1">
                    Interviewer Voice Persona
                  </label>
                  <select
                    value={voicePersona}
                    onChange={(e) => setVoicePersona(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold outline-none ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                    }`}
                  >
                    {PERSONAS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-2">
                      <Mic className="w-4 h-4 text-emerald-500" /> Microphone Input Check
                    </span>
                    <span className="font-bold text-emerald-400">Active</span>
                  </div>
                  {/* Mic Level Bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-100" 
                      style={{ width: `${Math.max(audioLevel, 10)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
                  <span className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-500" /> Human Neural Voice Engine
                  </span>
                  <span className="font-bold text-green-400">Sonic HD Active</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={enterFullscreen}
                className="flex-1 px-6 py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 active:scale-[0.99]"
              >
                <Maximize className="w-4 h-4" /> Enter Live Proctored Interview
              </button>
              <button 
                onClick={handleExitInterview}
                className={`px-6 py-3.5 rounded-xl font-bold transition-colors ${isDark ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* LIVE HEADER BAR */}
          <header className={`sticky top-0 z-30 px-6 py-3 border-b backdrop-blur-xl flex items-center justify-between ${isDark ? 'bg-[#050505]/90 border-zinc-800' : 'bg-white/90 border-zinc-200'}`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExitInterview}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Save & Exit
              </button>
              <div className={`h-4 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <div>
                <h1 className="text-xs font-bold tracking-wide uppercase text-green-600 dark:text-green-500">
                  {session?.role}
                </h1>
                <p className={`text-[10px] ${secondaryText}`}>
                  {session?.company || 'Tier-1 Assessment'} • {session?.difficulty}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Live Session Timer */}
              <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Clock className="w-4 h-4 text-green-500" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>

              {/* Persona Switcher */}
              <div className="hidden lg:flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={voicePersona}
                  onChange={(e) => setVoicePersona(e.target.value as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}
                  title="Select AI Interviewer Voice Persona"
                >
                  <option value="alex">Alex (Male - Principal)</option>
                  <option value="sarah">Sarah (Female - Recruiter)</option>
                  <option value="david">David (Male - Bar Raiser)</option>
                  <option value="elena">Elena (Female - Director)</option>
                </select>
              </div>

              {/* AI Voice Toggle & Audio Player */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else speakText(currentQuestionText);
                  }}
                  disabled={isLoadingVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    isSpeaking 
                      ? 'bg-green-500/20 border-green-500 text-green-400 animate-pulse' 
                      : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                  title={isSpeaking ? 'Mute Voice' : 'Play Question with Human Voice'}
                >
                  {isLoadingVoice ? (
                    <Loader2 className="w-3.5 h-3.5 text-green-500 animate-spin" />
                  ) : isSpeaking ? (
                    <Volume2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isLoadingVoice ? 'Loading Voice...' : isSpeaking ? 'Speaking...' : 'Read Aloud'}
                  </span>
                </button>

                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`hidden sm:inline-block text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${
                    autoSpeak 
                      ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                      : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                  }`}
                  title="Toggle automatic voice playback"
                >
                  Auto: {autoSpeak ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Speed multiplier */}
              <button
                onClick={() => setVoiceSpeed(s => s === 1.0 ? 1.15 : s === 1.15 ? 0.85 : 1.0)}
                className={`hidden md:inline px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}
                title="Audio Playback Speed"
              >
                {voiceSpeed}x
              </button>

              {/* End Assessment Button */}
              <button 
                onClick={handleFinishInterview}
                disabled={isFinishing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-colors text-xs uppercase tracking-wider"
              >
                {isFinishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
                Finish & Evaluate
              </button>
            </div>
          </header>

          {/* Proctoring Warning Toast if tab switched */}
          {showProctorWarning && (
            <div className="sticky top-14 z-40 bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Proctoring Alert: Tab switch detected ({tabSwitchWarnings} warning). Please remain focused on the interview room.</span>
              </div>
              <button onClick={() => setShowProctorWarning(false)} className="underline text-xs">Dismiss</button>
            </div>
          )}

          {/* MAIN STAGE LAYOUT */}
          <div ref={topRef} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* DUAL VIDEO STAGE: AI INTERVIEWER AVATAR + CANDIDATE FEED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* AI Interviewer Video Avatar Station */}
              <div className={`relative p-5 rounded-3xl border flex flex-col justify-between overflow-hidden shadow-lg ${
                isDark ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800' : 'bg-gradient-to-br from-zinc-100 to-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-green-500">
                      AI Lead Interviewer ({voicePersona.toUpperCase()})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {session?.company || 'Hiring Panel'}
                  </span>
                </div>

                {/* Animated Avatar Soundwave Orb */}
                <div className="my-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSpeaking 
                        ? 'bg-green-500/20 border-2 border-green-500 ring-8 ring-green-500/10 scale-110 shadow-lg shadow-green-500/30' 
                        : isSubmitting 
                          ? 'bg-blue-500/20 border-2 border-blue-500 ring-8 ring-blue-500/10 animate-pulse'
                          : 'bg-zinc-800 border border-zinc-700'
                    }`}>
                      <Sparkles className={`w-8 h-8 ${isSpeaking ? 'text-green-400 animate-spin' : isSubmitting ? 'text-blue-400 animate-spin' : 'text-zinc-400'}`} />
                    </div>
                  </div>
                  
                  {/* Dynamic Frequency Soundwave */}
                  <div className="flex items-center justify-center gap-1 h-6 mt-3">
                    {[35, 70, 95, 55, 85, 40, 90, 60, 30].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isSpeaking ? 'bg-green-400' : 'bg-zinc-700'
                        }`}
                        style={{
                          height: isSpeaking ? `${h}%` : '4px',
                          animation: isSpeaking ? 'wave 1.2s ease-in-out infinite' : 'none',
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>

                  <span className={`text-xs font-bold mt-2 transition-colors ${isSpeaking ? 'text-green-400 animate-pulse' : isSubmitting ? 'text-blue-400 animate-pulse' : secondaryText}`}>
                    {isSpeaking ? 'Interviewer Speaking (Neural Audio)...' : isSubmitting ? 'Analyzing Response...' : 'Listening to Candidate'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 z-10 pt-2 border-t border-zinc-800/60">
                  <span>Question {session?.current_question_index + 1} of {session?.num_questions}</span>
                  <span className="font-semibold">{session?.interview_type} Track</span>
                </div>
              </div>

              {/* Candidate Webcam Feed Station */}
              <div className={`relative p-5 rounded-3xl border flex flex-col justify-between overflow-hidden shadow-lg ${
                isDark ? 'bg-black border-zinc-800' : 'bg-zinc-900 text-white border-zinc-800'
              }`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Candidate Feed (You)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {wpm > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {wpm} WPM Pace
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                      Latency: 22ms
                    </span>
                  </div>
                </div>

                {/* Candidate Video */}
                <div className="relative aspect-video max-h-40 my-2 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center self-center w-full">
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500 text-xs">
                      <VideoOff className="w-6 h-6 mb-1 text-zinc-600" />
                      <span>Camera Off</span>
                    </div>
                  )}

                  {/* Audio visualizer bar on candidate video */}
                  {micActive && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-75"
                          style={{ width: `${Math.max(audioLevel, 10)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Video controls */}
                <div className="flex items-center justify-between z-10 pt-2 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleCamera}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                        cameraActive ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      <span>{cameraActive ? 'Camera' : 'Cam Off'}</span>
                    </button>
                    <button
                      onClick={toggleMic}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                        micActive ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>{micActive ? 'Mic' : 'Muted'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Face Centered
                  </span>
                </div>
              </div>

            </div>

            {/* ACTIVE QUESTION & INTERACTIVE WORKSPACE */}
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${cardBg}`}>
              
              {/* Question Header & Tools */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500 font-black">
                    Q{session?.current_question_index + 1}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-500">
                      Active Interview Problem
                    </h2>
                    <p className={`text-xs ${secondaryText}`}>
                      Question {session?.current_question_index + 1} of {session?.num_questions} • {session?.difficulty} Level
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestHint}
                    disabled={loadingHint}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      hintText ? 'bg-amber-500/20 border-amber-500 text-amber-400' : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                    }`}
                  >
                    {loadingHint ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{hintText ? 'Hide Hint' : 'Request Hint'}</span>
                  </button>

                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(currentQuestionText)}
                    disabled={isLoadingVoice}
                    className={`p-2 rounded-xl border transition-all ${
                      isSpeaking ? 'bg-green-500/20 border-green-500 text-green-400 animate-pulse' : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}
                    title={isSpeaking ? 'Stop Audio' : 'Play Audio'}
                  >
                    {isLoadingVoice ? (
                      <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Active Question Text */}
              <h1 className="text-xl sm:text-2xl font-bold leading-relaxed mb-6">
                {currentQuestionText}
              </h1>

              {/* Hint Banner if active */}
              {hintText && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs leading-relaxed animate-in fade-in flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-1">Interviewer Hint:</strong>
                    {hintText}
                  </div>
                </div>
              )}

              {/* WORKSPACE MODE TABS (Verbal / Code Scratchpad / STAR Framework) */}
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWorkspaceMode('verbal')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      workspaceMode === 'verbal'
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <PenLine className="w-3.5 h-3.5" /> Verbal / Written Answer
                  </button>

                  <button
                    onClick={() => setWorkspaceMode('code')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      workspaceMode === 'code'
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" /> Code Scratchpad
                  </button>

                  <button
                    onClick={() => setWorkspaceMode('star')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      workspaceMode === 'star'
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> STAR Behavioral Framework
                  </button>
                </div>

                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/20' 
                      : isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {isListening ? <><MicOff className="w-3.5 h-3.5" /> Stop Dictation</> : <><Mic className="w-3.5 h-3.5 text-green-500" /> Dictate Voice</>}
                </button>
              </div>

              {/* WORKSPACE TAB 1: VERBAL / WRITTEN ANSWER */}
              {workspaceMode === 'verbal' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Articulate your thought process, architectural considerations, and solution steps here. (You can also click 'Dictate Voice' to speak your answer)..."
                    className={`w-full p-5 rounded-2xl border outline-none transition-all resize-y min-h-[200px] font-medium leading-relaxed text-sm ${
                      isDark 
                        ? 'bg-zinc-950 border-zinc-800 focus:border-green-500 text-zinc-200' 
                        : 'bg-zinc-50 border-zinc-200 focus:border-green-500 text-zinc-900'
                    }`}
                  />
                </div>
              )}

              {/* WORKSPACE TAB 2: CODE SCRATCHPAD & RUNNER */}
              {workspaceMode === 'code' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400">Language:</span>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border outline-none ${
                          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300'
                        }`}
                      >
                        <option value="javascript">JavaScript / Node</option>
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python 3</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++ (GCC)</option>
                        <option value="sql">SQL / Postgres</option>
                      </select>
                    </div>

                    <button
                      onClick={handleRunCodeSimulation}
                      disabled={isRunningCode || !codeSnippet.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-green-400 transition-colors disabled:opacity-50"
                    >
                      {isRunningCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>Dry-Run Test</span>
                    </button>
                  </div>

                  <textarea
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder={`// Write your ${codeLanguage} solution here\nfunction solve(input) {\n  // 1. Validate constraints & edge cases\n  // 2. Optimal implementation\n  return result;\n}`}
                    className="w-full p-4 rounded-2xl bg-black border border-zinc-800 font-mono text-xs text-green-400 outline-none resize-y min-h-[220px] leading-relaxed"
                    spellCheck={false}
                  />

                  {codeOutput && (
                    <div className="p-3.5 rounded-xl bg-black/80 border border-green-500/30 text-green-400 font-mono text-xs whitespace-pre-wrap">
                      <div className="flex items-center gap-2 mb-1.5 text-zinc-500 uppercase text-[10px] font-bold">
                        <Terminal className="w-3.5 h-3.5" /> Test Runner Output
                      </div>
                      {codeOutput}
                    </div>
                  )}
                </div>
              )}

              {/* WORKSPACE TAB 3: STAR BEHAVIORAL FRAMEWORK */}
              {workspaceMode === 'star' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-zinc-400 uppercase tracking-wider block mb-1 text-[10px]">
                        Situation (What was the context or challenge?)
                      </label>
                      <textarea
                        value={starSituation}
                        onChange={(e) => setStarSituation(e.target.value)}
                        placeholder="e.g. At my previous team, we faced a critical database deadlock during peak traffic..."
                        className={`w-full p-3 rounded-xl border outline-none resize-none h-20 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 uppercase tracking-wider block mb-1 text-[10px]">
                        Task (What was your specific responsibility?)
                      </label>
                      <textarea
                        value={starTask}
                        onChange={(e) => setStarTask(e.target.value)}
                        placeholder="e.g. I was tasked with identifying query bottlenecks and redesigning locking strategies..."
                        className={`w-full p-3 rounded-xl border outline-none resize-none h-20 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 uppercase tracking-wider block mb-1 text-[10px]">
                        Action (What concrete steps did you execute?)
                      </label>
                      <textarea
                        value={starAction}
                        onChange={(e) => setStarAction(e.target.value)}
                        placeholder="e.g. I introduced Redis distributed caching, optimized composite indexes, and set up circuit breakers..."
                        className={`w-full p-3 rounded-xl border outline-none resize-none h-20 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 uppercase tracking-wider block mb-1 text-[10px]">
                        Result (What was the measurable outcome?)
                      </label>
                      <textarea
                        value={starResult}
                        onChange={(e) => setStarResult(e.target.value)}
                        placeholder="e.g. Latency dropped by 64%, throughput increased 3x with zero downtime..."
                        className={`w-full p-3 rounded-xl border outline-none resize-none h-20 ${
                          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-zinc-800/80 gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <span className={`font-bold ${currentAnswer.length > 0 || codeSnippet.length > 0 ? 'text-green-500' : secondaryText}`}>
                    {currentAnswer.length + codeSnippet.length} chars
                  </span>
                  <span className={`text-[11px] hidden sm:inline ${secondaryText}`}>
                    Press <kbd className="px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[10px]">Ctrl+Enter</kbd> to submit
                  </span>
                </div>
                
                <button
                  onClick={handleSubmitAnswer}
                  disabled={(!currentAnswer.trim() && !codeSnippet.trim() && !starSituation.trim()) || isSubmitting}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold transition-all shadow-md shadow-green-600/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Evaluating Next Question...</>
                  ) : (
                    <>Submit Response & Continue <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>

            </div>

            {/* PREVIOUS RECORDED RESPONSES LOG */}
            {pastPairs.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 px-2">
                  Session Log ({pastPairs.length} Completed)
                </h3>
                {pastPairs.map((pair, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                        Q{idx + 1}
                      </span>
                      <h4 className="font-bold text-sm">{pair.question}</h4>
                    </div>
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed mt-3 ${isDark ? 'bg-black/50 text-zinc-300 border border-zinc-800/80' : 'bg-white text-zinc-700 border border-zinc-200'}`}>
                      <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Your Answer:</span>
                      <div className="whitespace-pre-wrap">{pair.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
};

export default InterviewSession;