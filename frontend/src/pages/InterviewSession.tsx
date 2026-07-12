import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Mic, MicOff, Clock, ShieldAlert, Maximize, ArrowLeft 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getInterview, evaluateInterview } from '../services/interview';
import { useVoiceInterview } from '../hooks/useVoiceInterview';

// New UI Components
import AudioVisualizer from '../components/AudioVisualizer';
import ThinkingIndicator from '../components/ThinkingIndicator';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const sessionContainerRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const bgColor = isDark ? 'bg-black' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  // --- Upgraded Voice Hook Integration ---
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
    toggleMute
  } = useVoiceInterview({
    sessionId: id || '',
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getInterview(Number(id));
        setSession(data);
        
        if (data.status === 'completed') {
          navigate(`/interviews/feedback/${id}`, { replace: true });
        }
      } catch (error) {
        console.error("Unauthorized access or session not found.");
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
      
      if (isFull && !isConnected) {
        connect();
      } else if (!isFull && isConnected) {
        disconnect();
      }
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
      console.error("Fullscreen error:", err);
      alert("Your browser blocked full-screen mode. Please allow it to continue.");
    }
  };

  const handleExitSession = async () => {
    disconnect();
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    navigate('/interviews');
  };

  const triggerEvaluation = async () => {
    disconnect();
    setIsEvaluating(true);
    try {
      await evaluateInterview(Number(id));
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      navigate(`/interviews/feedback/${id}`);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor} ${textColor} p-4`}>
        <div className={`p-10 rounded-3xl border ${cardBg} text-center max-w-md w-full shadow-2xl`}>
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Evaluating Session</h2>
          <p className={secondaryText}>Our AI is analyzing your responses for technical accuracy, communication, and confidence. This will take just a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={sessionContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}
    >
      {!isFullscreen ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`max-w-md w-full p-8 text-center rounded-2xl border shadow-xl ${cardBg}`}>
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Strict Environment Required</h2>
            <p className={`font-medium leading-relaxed mb-8 text-sm ${secondaryText}`}>
              This mock interview requires microphone access and a full-screen environment. 
              Ensure you are in a quiet room. The AI will speak to you and listen to your responses naturally.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={enterFullscreen}
                className="w-full px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Maximize className="w-4 h-4" /> Enter Session
              </button>
              <button 
                onClick={handleExitSession}
                className={`w-full px-6 py-3 rounded-xl font-bold transition-colors ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header className={`z-20 px-6 py-4 flex justify-between items-center backdrop-blur-md`}>
            <div className="flex items-center gap-4">
              <div className={`hidden sm:flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isConnected ? 'Live' : 'Connecting...'}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={triggerEvaluation} className="text-xs font-bold px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700">
                End & Evaluate
              </button>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeSpent)}
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center relative">
            
            {voiceError && (
              <div className="absolute top-0 left-0 right-0 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-center rounded-xl font-medium">
                {voiceError}
              </div>
            )}

            {/* AI Dialogue Area */}
            <div className="mb-12 transition-all duration-300 ease-in-out transform">
              <div className="flex items-center gap-4 mb-6 min-h-[32px]">
                {isThinking ? (
                  <ThinkingIndicator />
                ) : (
                  <>
                    <AudioVisualizer isActive={isPlaying} variant="ai" />
                    <span className={`text-sm font-bold uppercase tracking-wider ${isPlaying ? 'text-green-500' : secondaryText}`}>
                      Interviewer {isPlaying && 'Speaking...'}
                    </span>
                  </>
                )}
              </div>
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-medium leading-relaxed transition-opacity duration-300 ${aiText && !isThinking ? 'opacity-100' : 'opacity-40'}`}>
                {aiText || "Setting up the interview..."}
              </h2>
            </div>

            {/* Candidate Transcript Area */}
            <div className="mt-8 pt-8 border-t border-zinc-800/50">
               <div className="flex items-center gap-4 mb-4">
                <AudioVisualizer isActive={isRecording && !isThinking && !isPlaying} variant="candidate" />
                <span className={`text-sm font-bold uppercase tracking-wider ${isRecording ? 'text-blue-500' : secondaryText}`}>
                  You {isRecording && !isThinking && !isPlaying && 'Speaking...'}
                </span>
              </div>
              <p className={`text-xl font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'} italic transition-opacity duration-300 ${isThinking ? 'opacity-50' : 'opacity-100'}`}>
                {transcript || (isConnected ? "Listening..." : "")}
              </p>
            </div>

            {/* Floating Controls with Volume Glow Effect */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50">
              <div className={`relative flex items-center gap-4 p-3 rounded-full border backdrop-blur-xl ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
                
                {/* Dynamic Volume Glow Ring */}
                {isRecording && !isThinking && !isPlaying && volume > 0 && (
                  <div 
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-md transition-all duration-75"
                    style={{ transform: `scale(${1 + (volume / 200)})` }}
                  />
                )}

                <button 
                  onClick={toggleMute}
                  disabled={!isConnected}
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all z-10 ${
                    isRecording 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                      : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                  } disabled:opacity-50`}
                >
                  {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
              </div>
            </div>

          </main>
        </>
      )}
    </div>
  );
};

export default InterviewSession;