import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Send, Loader2, StopCircle, ArrowLeft, Bot, User, 
  Maximize, ShieldCheck, Clock, Lock, ShieldAlert
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
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const interviewContainerRef = useRef<HTMLDivElement>(null);

  // Modern SaaS Color Palette mapping
  const bgColor = isDark ? 'bg-[#09090b]' : 'bg-[#fafafa]';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const glassBorder = isDark ? 'border-white/10' : 'border-zinc-200';
  
  const aiBubble = isDark ? 'bg-[#18181b] border-white/5 text-zinc-100' : 'bg-white border-zinc-200 shadow-sm text-zinc-800';
  const userBubble = 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md';

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.chat_history, isFullscreen]);

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

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor}`}>
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className={`font-medium tracking-wide ${secondaryText}`}>Initializing AI Environment...</p>
      </div>
    );
  }

  return (
    <div 
      ref={interviewContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-green-500/30 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-hidden' : ''}`}
    >
      {!isFullscreen ? (
        // Cinematic Pre-screen
        <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className={`relative max-w-md w-full p-10 text-center rounded-3xl border shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-950/80 border-white/10' : 'bg-white/80 border-zinc-200'}`}>
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl animate-pulse blur-xl" />
              <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-500/10 border border-amber-500/30 shadow-inner">
                <ShieldAlert className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
              Proctored Environment
            </h2>
            <p className={`font-medium leading-relaxed mb-10 text-sm ${secondaryText}`}>
              This AI interview requires a distraction-free, full-screen environment. 
              Exiting full-screen will hide your conversation to maintain session integrity.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={enterFullscreen}
                className="group relative w-full px-6 py-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold overflow-hidden transition-transform active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                  <Maximize className="w-4 h-4" /> Enter Full-Screen
                </span>
              </button>
              <button 
                onClick={handleExitInterview}
                className={`w-full px-6 py-3.5 rounded-xl font-bold transition-colors ${isDark ? 'hover:bg-white/5 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Modern Glassmorphic Header */}
          <header className={`sticky top-0 z-30 px-6 py-4 border-b backdrop-blur-xl transition-colors duration-300 flex items-center justify-between ${isDark ? 'bg-[#09090b]/70 border-white/10' : 'bg-white/70 border-zinc-200'}`}>
            <div className="flex items-center gap-5">
              <button 
                onClick={handleExitInterview}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'}`}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Exit
              </button>
              <div className={`h-5 w-px ${isDark ? 'bg-white/10' : 'bg-zinc-300'}`} />
              <div>
                <h1 className="text-sm font-bold tracking-wide">
                  {session?.role} <span className="font-medium opacity-50">Interview</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className={`flex items-center gap-2 text-sm font-semibold tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Clock className="w-4 h-4 text-green-500" />
                <span className="w-12 font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider border ${isDark ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Proctored
              </div>
              <button 
                onClick={handleFinishInterview}
                disabled={isFinishing}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all active:scale-[0.98] text-xs uppercase tracking-wider shadow-sm shadow-red-500/20"
              >
                {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                Submit Exam
              </button>
            </div>
          </header>

          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar scroll-smooth">
            <div className="w-full max-w-3xl space-y-8 pb-40 pt-4">
              
              {/* Context Banner */}
              <div className="flex justify-center">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}>
                  <Lock className="w-3 h-3" /> Question {session?.current_question_index + 1} of {session?.num_questions}
                </div>
              </div>

              {session?.chat_history?.map((msg: any, idx: number) => (
                <div key={idx} className={`flex gap-3 sm:gap-4 ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  
                  {msg.role === 'ai' && (
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800 text-green-500' : 'bg-white border-zinc-200 text-green-600 shadow-sm'}`}>
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}

                  <div className={`relative p-5 max-w-[85%] sm:max-w-[75%] leading-relaxed text-[15px] ${
                    msg.role === 'ai' 
                      ? `${aiBubble} rounded-2xl rounded-tl-sm border` 
                      : `${userBubble} rounded-2xl rounded-tr-sm`
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === 'user' && (
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </main>

          {/* Floating Modern Input Area */}
          <footer className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/20 to-transparent pointer-events-none flex flex-col items-center">
            
            {/* Input Box */}
            <div className={`pointer-events-auto w-full max-w-3xl relative flex flex-col sm:flex-row gap-2 p-2 rounded-2xl sm:rounded-3xl border backdrop-blur-xl shadow-2xl transition-colors duration-300 ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-zinc-200'}`}>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your detailed answer here..."
                className={`flex-1 p-3 sm:p-4 bg-transparent outline-none resize-none min-h-[60px] max-h-[200px] text-[15px] font-medium leading-relaxed custom-scrollbar placeholder:text-zinc-500`}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitAnswer();
                  }
                }}
              />
              <div className="flex sm:flex-col justify-end items-end p-2 gap-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:hover:bg-green-500 text-white transition-all shadow-md active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Mobile Submit Button Fallback */}
            <div className="w-full max-w-3xl mt-4 sm:hidden pointer-events-auto">
               <button 
                onClick={handleFinishInterview}
                disabled={isFinishing}
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs shadow-xl active:scale-[0.98] transition-transform"
              >
                {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
                End Interview & Evaluate
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default InterviewSession;