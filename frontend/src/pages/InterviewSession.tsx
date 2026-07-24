import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Loader2, StopCircle, ArrowLeft, Maximize, ShieldAlert, 
  Clock, ShieldCheck, CheckCircle2, ChevronRight, PenLine, Lock
} from 'lucide-react';
import { getInterviewDetails, submitAnswer, completeInterview } from '../services/interview'; 

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [session, setSession] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fullscreen & Proctored State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const interviewContainerRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Modern SaaS Color Palette
  const bgColor = isDark ? 'bg-[#050505]' : 'bg-[#fafafa]';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const cardBg = isDark ? 'bg-[#0a0a0a] border-zinc-800/80' : 'bg-white border-zinc-200';
  
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
      } catch (error) {
        console.error("Failed to load session", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  // Handle Fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer
  useEffect(() => {
    let timer: any;
    if (isFullscreen && session && session.status !== 'completed') {
      timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen, session]);

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
    if (document.fullscreenElement) await document.exitFullscreen();
    navigate('/interviews');
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    setIsSubmitting(true);
    
    try {
      const updatedSession = await submitAnswer(id!, currentAnswer);
      setSession(updatedSession);
      setCurrentAnswer('');
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!window.confirm("Are you sure you want to end the interview? The AI will evaluate your answers so far.")) return;
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

  // --- Parse History to separate past Q&A from Current Question ---
  const history = session?.chat_history || [];
  let currentQuestionText = "Loading next question...";
  const pastPairs: { question: string, answer: string }[] = [];

  if (history.length > 0) {
    const lastMsg = history[history.length - 1];
    if (lastMsg.role === 'ai') {
      currentQuestionText = lastMsg.content;
      // Pair previous elements (AI = Q, User = A)
      for (let i = 0; i < history.length - 1; i += 2) {
        if (history[i].role === 'ai' && history[i+1]?.role === 'user') {
          pastPairs.push({ question: history[i].content, answer: history[i+1].content });
        }
      }
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className={`font-medium tracking-wide ${secondaryText}`}>Initializing Assessment...</p>
      </div>
    );
  }

  return (
    <div 
      ref={interviewContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-green-500/30 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      {!isFullscreen ? (
        // Cinematic Pre-screen
        <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className={`relative max-w-md w-full p-10 text-center rounded-3xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-950/80 border-white/10' : 'bg-white border-zinc-200'}`}>
            <div className="w-16 h-16 mx-auto mb-6 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Proctored Assessment</h2>
            <p className={`font-medium leading-relaxed mb-8 text-sm ${secondaryText}`}>
              This evaluation requires a distraction-free, full-screen environment. 
              Exiting full-screen will immediately hide your active session to ensure integrity.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={enterFullscreen}
                className="w-full px-6 py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Maximize className="w-4 h-4" /> Enter Full-Screen
              </button>
              <button 
                onClick={handleExitInterview}
                className={`w-full px-6 py-3.5 rounded-xl font-bold transition-colors ${isDark ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className={`sticky top-0 z-30 px-6 py-3 border-b backdrop-blur-xl flex items-center justify-between ${isDark ? 'bg-[#050505]/90 border-zinc-800' : 'bg-white/90 border-zinc-200'}`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExitInterview}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Save & Exit
              </button>
              <div className={`h-4 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <h1 className="text-sm font-bold tracking-wide uppercase text-green-600 dark:text-green-500">
                {session?.role} Assessment
              </h1>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Clock className="w-4 h-4 text-green-500" />
                <span className="w-12 font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border ${isDark ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-green-50 border-green-200 text-green-600'}`}>
                <ShieldCheck className="w-3.5 h-3.5" /> Proctored
              </div>
              <button 
                onClick={handleFinishInterview}
                disabled={isFinishing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-colors text-xs uppercase tracking-wider"
              >
                {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                End Assessment
              </button>
            </div>
          </header>

          <div ref={topRef} className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar: Progress Tracking */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className={`sticky top-24 p-6 rounded-3xl border shadow-sm ${cardBg}`}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Assessment Progress</h3>
                
                <div className="space-y-4">
                  {Array.from({ length: session.num_questions }).map((_, idx) => {
                    const isCompleted = idx < session.current_question_index;
                    const isCurrent = idx === session.current_question_index;
                    
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : isCurrent 
                                ? isDark ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-green-50 border-green-600 text-green-600'
                                : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-zinc-50 border-zinc-300 text-zinc-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : (idx + 1)}
                          </div>
                          {idx !== session.num_questions - 1 && (
                            <div className={`w-px h-6 my-1 ${isCompleted ? 'bg-green-500' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                          )}
                        </div>
                        <div className={`mt-1 text-sm font-bold ${
                          isCompleted ? (isDark ? 'text-zinc-300' : 'text-zinc-700') : 
                          isCurrent ? 'text-green-600 dark:text-green-500' : 
                          secondaryText
                        }`}>
                          Question {idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Main Content */}
            <div className="lg:col-span-3 space-y-8 pb-20">
              
              {/* Completed Questions Log */}
              {pastPairs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 px-2">Recorded Responses</h3>
                  {pastPairs.map((pair, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border shadow-sm ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase bg-green-500/10 text-green-600 dark:text-green-500`}>
                          Question {idx + 1}
                        </span>
                      </div>
                      <p className="font-semibold text-lg mb-4">{pair.question}</p>
                      <div className={`p-4 rounded-xl text-sm leading-relaxed ${isDark ? 'bg-black/50 text-zinc-300' : 'bg-white text-zinc-700 border border-zinc-100'}`}>
                        <span className="text-xs font-bold uppercase text-zinc-500 block mb-2">Your Answer:</span>
                        {pair.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Assessment Area */}
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-500">
                    <PenLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-500">
                      Active Question
                    </h2>
                    <p className={`text-xs ${secondaryText}`}>Question {session.current_question_index + 1} of {session.num_questions}</p>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold leading-relaxed mb-8">
                  {currentQuestionText}
                </h1>

                {/* Response Drafting Box */}
                <div className="relative">
                  <div className={`absolute top-0 left-0 w-full p-4 border-b flex justify-between items-center rounded-t-2xl z-10 backdrop-blur-md ${isDark ? 'bg-[#111]/80 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'}`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Draft Response</span>
                    <Lock className={`w-3.5 h-3.5 ${secondaryText}`} />
                  </div>
                  
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Provide a comprehensive answer here..."
                    className={`w-full pt-16 p-6 rounded-2xl border outline-none transition-all resize-y min-h-[250px] font-medium leading-relaxed ${
                      isDark 
                        ? 'bg-[#111] border-zinc-800 focus:border-green-500/50 text-zinc-200' 
                        : 'bg-zinc-50 border-zinc-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 text-zinc-900'
                    }`}
                  />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                    <div className={`text-xs font-bold tracking-wider ${currentAnswer.length > 0 ? 'text-green-600 dark:text-green-500' : secondaryText}`}>
                      {currentAnswer.length} characters written
                    </div>
                    
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer.trim() || isSubmitting}
                      className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold transition-all shadow-sm shadow-green-600/20 active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                      ) : (
                        <>Submit & Next <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewSession;