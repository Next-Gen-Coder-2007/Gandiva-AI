import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Send, Clock, CheckCircle2, AlertCircle, Maximize, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getInterview, startInterview, submitAnswer, evaluateInterview } from '../services/interview';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const sessionContainerRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Fullscreen & Timer State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSkipAlert, setShowSkipAlert] = useState(false);

  const bgColor = isDark ? 'bg-black' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getInterview(Number(id));
        
        setSession(data);
        
        const firstUnanswered = data.questions.findIndex((q: any) => !q.answer);
        if (firstUnanswered !== -1) {
          setCurrentQuestionIndex(firstUnanswered);
          if (data.status === 'pending') {
            await startInterview(Number(id));
          }
        } else if (data.status === 'completed') {
          navigate(`/interviews/feedback/${id}`, { replace: true });
        } else {
          triggerEvaluation();
        }
      } catch (error) {
        console.error("Unauthorized access or session not found.");
        navigate('/interviews', { replace: true }); // replace: true prevents them from hitting the back button
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer: Only run when in fullscreen and actively answering
  useEffect(() => {
    let timer: any;
    if (isFullscreen && !isEvaluating) {
      timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen, isEvaluating, currentQuestionIndex]);

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
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    navigate('/interviews');
  };

  const handleNextClick = () => {
    if (!answerText.trim()) {
      setShowSkipAlert(true); // Trigger custom modal instead of window.confirm
      return;
    }
    submitCurrentAnswer();
  };

  const submitCurrentAnswer = async () => {
    setShowSkipAlert(false);
    setIsSubmitting(true);
    try {
      const currentQ = session.questions[currentQuestionIndex];
      await submitAnswer(currentQ.id, answerText || "[Candidate Skipped]", timeSpent);
      
      setAnswerText("");
      setTimeSpent(0);

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await triggerEvaluation();
      }
    } catch (error) {
      console.error("Failed to submit answer", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerEvaluation = async () => {
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
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-green-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            <CheckCircle2 className="absolute inset-0 m-auto w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Evaluating Session</h2>
          <p className={secondaryText}>Our AI is analyzing your responses for technical accuracy, communication, and confidence. This will take just a moment.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = session?.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / session?.questions.length) * 100;

  return (
    <div 
      ref={sessionContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${bgColor} ${textColor} ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      
      {!isFullscreen ? (
        // Strict Environment Screen
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`max-w-md w-full p-8 text-center rounded-2xl border shadow-xl ${cardBg}`}>
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Strict Environment Required</h2>
            <p className={`font-medium leading-relaxed mb-8 text-sm ${secondaryText}`}>
              This mock interview requires a distraction-free, full-screen environment to simulate a real assessment. 
              Exiting full-screen will hide your questions to maintain integrity.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={enterFullscreen}
                className="w-full px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Maximize className="w-4 h-4" /> Enter Full-Screen
              </button>
              <button 
                onClick={handleExitSession}
                className={`w-full px-6 py-3 rounded-xl font-bold transition-colors ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Live Interview Session
        <>
          {/* Top Navbar */}
          <header className={`sticky top-0 z-20 px-6 py-4 border-b flex justify-between items-center shadow-sm backdrop-blur-md ${isDark ? 'border-zinc-800 bg-black/90' : 'border-zinc-200 bg-white/90'}`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExitSession}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Save & Exit
              </button>
              <div className={`h-4 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              <div>
                <h1 className="font-bold text-sm sm:text-lg truncate">{session.role} Interview</h1>
                <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider ${secondaryText}`}>
                  Question {currentQuestionIndex + 1} of {session.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden sm:flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Proctored
              </div>
              <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono text-sm border ${isDark ? 'bg-zinc-900 border-zinc-800 text-green-400' : 'bg-zinc-100 border-zinc-200 text-green-600'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeSpent)}
              </div>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-zinc-800">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col">
            <div className={`p-6 sm:p-8 rounded-3xl border mb-6 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                  {currentQuestion?.category || 'General'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed">
                {currentQuestion?.question_text}
              </h2>
            </div>

            <div className="flex-1 flex flex-col relative">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                className={`w-full flex-1 p-6 rounded-3xl border outline-none resize-none transition-colors ${
                  isDark 
                    ? 'bg-zinc-900/50 border-zinc-800 focus:border-green-500/50 text-white placeholder:text-zinc-600' 
                    : 'bg-white border-zinc-200 focus:border-green-500/50 text-zinc-900 placeholder:text-zinc-400'
                }`}
              />
              
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                {!answerText.trim() && (
                  <span className={`text-sm flex items-center gap-1 ${secondaryText}`}>
                    <AlertCircle className="w-4 h-4" /> You can skip if unsure
                  </span>
                )}
                <button 
                  onClick={handleNextClick}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                    answerText.trim() 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' 
                      : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
                  } disabled:opacity-50`}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{answerText.trim() ? 'Submit Answer' : 'Skip'} <Send className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {showSkipAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border ${cardBg}`}>
            
            <h3 className="text-xl font-bold mb-6">Skip Question?</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <p className={`mt-1 text-sm leading-relaxed ${secondaryText}`}>
                    You are about to skip this question without providing an answer. This will negatively impact your technical and completeness score.
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center justify-end gap-3 pt-6 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <button 
                  onClick={() => setShowSkipAlert(false)} 
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={submitCurrentAnswer} 
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-900/20"
                >
                  Skip Question
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewSession;