import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Mic, MicOff, Clock, ShieldAlert, Maximize, PhoneOff, User, Bot, CheckCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getInterview, evaluateInterview } from '../services/interview';
import { useVoiceInterview } from '../hooks/useVoiceInterview';

import AudioVisualizer from '../components/AudioVisualizer';
import ThinkingIndicator from '../components/ThinkingIndicator';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // GREEN THEME VARIABLES
  const bgColor = isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-[#111116] border-zinc-800' : 'bg-white border-zinc-200 shadow-sm';
  const activeAiCardBg = isDark ? 'bg-[#1a2e22] border-green-500/50' : 'bg-green-50 border-green-300';
  const activeUserCardBg = isDark ? 'bg-[#1a2e22] border-green-500/50' : 'bg-green-50 border-green-300';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const iconBg = isDark ? 'bg-[#1e1e2d] border-[#161622]' : 'bg-zinc-100 border-white shadow-sm';

  const sessionContainerRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const {
    isConnected,
    isRecording,
    isPlaying,
    isThinking,
    volume,
    transcript,
    aiText,
    error: voiceError,
    connect,
    disconnect,
    toggleMute,
    submitAnswer // Import the new trigger
  } = useVoiceInterview({ sessionId: id || '' });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getInterview(Number(id));
        setSession(data);
        if (data.status === 'completed') navigate(`/interviews/feedback/${id}`, { replace: true });
      } catch (error) {
        navigate('/interviews', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull && !isConnected) connect();
      else if (!isFull && isConnected) disconnect();
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [connect, disconnect, isConnected]);

  useEffect(() => {
    let timer: any;
    if (isFullscreen && isConnected && !isEvaluating) {
      timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen, isConnected, isEvaluating]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const enterFullscreen = async () => {
    try {
      if (sessionContainerRef.current?.requestFullscreen) {
        await sessionContainerRef.current.requestFullscreen();
      }
    } catch (err) {
      alert("Please allow full-screen mode to continue.");
    }
  };

  const triggerEvaluation = async () => {
    disconnect();
    setIsEvaluating(true);
    try {
      await evaluateInterview(Number(id));
      if (document.fullscreenElement) await document.exitFullscreen();
      navigate(`/interviews/feedback/${id}`);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading || isEvaluating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor} ${textColor} p-4`}>
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold">{isEvaluating ? 'Evaluating Session' : 'Loading...'}</h2>
      </div>
    );
  }

  const activeSubtitle = isThinking 
    ? (transcript === "Processing your answer..." ? transcript : "Thinking...") 
    : (isPlaying ? aiText : (transcript || (isConnected ? "Listening..." : "Connecting...")));

  return (
    <div 
      ref={sessionContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}
    >
      {!isFullscreen ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`max-w-md w-full p-8 text-center rounded-2xl border ${cardBg}`}>
            <ShieldAlert className="w-12 h-12 text-green-500 mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-3">Strict Environment Required</h2>
            <p className={`text-sm mb-8 leading-relaxed ${secondaryText}`}>
              This mock interview requires full-screen mode and microphone access. Ensure you are in a quiet room.
            </p>
            <button 
              onClick={enterFullscreen}
              className="w-full px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all"
            >
              <Maximize className="w-4 h-4" /> Enter Session
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full h-full relative">
          
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold tracking-wide">Interview generation</h1>
            <div className="flex items-center gap-4">
               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'Live' : 'Connecting...'}
              </div>
              <div className={`flex items-center gap-2 font-mono text-sm ${secondaryText}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeSpent)}
              </div>
            </div>
          </header>

          <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center min-h-0">
            
            <div className={`relative flex flex-col items-center justify-center h-full max-h-[60vh] rounded-2xl border transition-all duration-300 ${isPlaying ? activeAiCardBg : cardBg}`}>
              <div className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-wider ${secondaryText}`}>AI Interviewer</div>
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4 relative ${iconBg}`}>
                {isThinking ? <ThinkingIndicator /> : isPlaying ? <AudioVisualizer isActive={true} variant="ai" /> : <Bot className={`w-12 h-12 ${secondaryText}`} />}
              </div>
              <h3 className="text-xl font-medium">AI Interviewer</h3>
            </div>

            <div className={`relative flex flex-col items-center justify-center h-full max-h-[60vh] rounded-2xl border transition-all duration-300 ${isRecording && !isThinking && !isPlaying && volume > 10 ? activeUserCardBg : cardBg}`}>
              <div className={`absolute top-4 left-4 text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Candidate</div>
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4 overflow-hidden relative ${iconBg}`}>
                <User className={`w-12 h-12 ${secondaryText}`} />
                {isRecording && !isThinking && !isPlaying && (
                  <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center backdrop-blur-sm">
                    <AudioVisualizer isActive={true} variant="candidate" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-medium">You</h3>
            </div>

          </main>

          <div className="mt-8 mb-6 flex justify-center">
            <div className={`w-full max-w-4xl rounded-2xl py-4 px-8 min-h-[80px] flex items-center justify-center text-center shadow-lg transition-all border ${cardBg}`}>
              <p className={`text-lg md:text-xl font-medium leading-relaxed transition-opacity duration-300 ${isThinking ? `${secondaryText} italic animate-pulse` : textColor}`}>
                {activeSubtitle}
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4">
            <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-md ${isRecording ? (isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800') : 'bg-red-500 hover:bg-red-600 text-white'}`}>
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            {/* NEW: Done Speaking Button to trigger the backend local models */}
            {isRecording && !isThinking && !isPlaying && (
              <button 
                onClick={submitAnswer}
                className="px-6 py-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-500/20"
              >
                <CheckCircle className="w-5 h-5" /> Done Speaking
              </button>
            )}

            <button onClick={triggerEvaluation} className="px-6 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20">
              <PhoneOff className="w-5 h-5" /> End Interview
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default InterviewSession;