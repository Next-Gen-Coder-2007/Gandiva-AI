import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getQuizById, submitQuizAttempt } from '../services/quiz';
import { 
  Loader2, ArrowLeft, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Send, Clock, Maximize, ShieldAlert
} from 'lucide-react';

export default function AttemptQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Container Ref for requesting Fullscreen on this specific element
  const quizContainerRef = useRef<HTMLDivElement>(null);

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz & Exam State
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Proctoring/Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // 1. Fetch Quiz Data
  useEffect(() => {
    if (id) fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await getQuizById(id!);
      setQuiz(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 3. Timer (Only runs when in fullscreen and not finished)
  useEffect(() => {
    let timer: any;
    if (isFullscreen && !result) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isFullscreen, result]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 4. Handlers
  const enterFullscreen = async () => {
    try {
      if (quizContainerRef.current?.requestFullscreen) {
        await quizContainerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      alert("Your browser blocked full-screen mode. Please allow it to continue.");
    }
  };

  const handleExitQuiz = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    navigate('/quizzes');
  };

  // FIXED: Reliable click handler for custom div options
  const handleSelectChoice = (questionId: number, choiceId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        answers: quiz.questions.map((q: any) => ({
          question_id: q.id,
          selected_choice_id: answers[q.id] || null
        }))
      };
      
      const response = await submitQuizAttempt(id!, payload);
      setResult(response.data);
      
      // Auto-exit fullscreen on submit
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit attempt");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- RENDERERS ---------------- //

  if (loading) {
    return (
      <div className={`min-h-[80vh] flex items-center justify-center ${isDark ? 'text-green-500' : 'text-green-600'}`}>
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[80vh] p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>{error}</p>
        <button onClick={handleExitQuiz} className="mt-6 px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- RESULT SCREEN --- //
  if (result) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans ${isDark ? 'bg-black text-white' : 'bg-neutral-50 text-black'}`}>
        <div className={`w-full max-w-2xl p-10 rounded-2xl border shadow-xl text-center ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black mb-4">Assessment Complete</h2>
          <p className={`text-lg font-medium mb-10 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            You scored <span className="text-green-500 font-bold text-2xl mx-1">{result.score}</span> out of {quiz.no_of_questions}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate(`/quizzes/${id}/history`)}
              className={`px-6 py-3 rounded-lg font-bold transition-all border ${
                isDark ? 'border-neutral-700 hover:bg-neutral-900 text-white' : 'border-neutral-300 hover:bg-neutral-50 text-black'
              }`}
            >
              View Detailed History
            </button>
            <button 
              onClick={() => navigate('/quizzes')}
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === quiz.no_of_questions;
  const progressPercentage = (answeredCount / quiz.no_of_questions) * 100;
  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    // This wrapper acts as the Fullscreen container
    <div 
      ref={quizContainerRef}
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#050505] text-white' : 'bg-neutral-50 text-black'
      } ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      
      {/* --- LOCK SCREEN (Triggers if not in fullscreen) --- */}
      {!isFullscreen ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`max-w-md w-full p-8 text-center rounded-2xl border shadow-xl ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-3">Strict Environment Required</h2>
            <p className={`font-medium leading-relaxed mb-8 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              This assessment requires a distraction-free, full-screen environment. 
              Exiting full-screen will hide your questions to maintain integrity.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={enterFullscreen}
                className="w-full px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Maximize className="w-4 h-4" /> Enter Full-Screen
              </button>
              <button 
                onClick={handleExitQuiz}
                className={`w-full px-6 py-3 rounded-lg font-bold transition-colors ${isDark ? 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                Exit Assessment
              </button>
            </div>
          </div>
        </div>
      ) : (

        /* --- ACTIVE EXAM UI (Visible only in Fullscreen) --- */
        <>
          {/* Header */}
          <div className={`sticky top-0 z-20 px-6 py-3 border-b flex items-center justify-between shadow-sm backdrop-blur-md ${
            isDark ? 'bg-[#0a0a0a]/90 border-neutral-800' : 'bg-white/90 border-neutral-200'
          }`}>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExitQuiz}
                className={`flex items-center gap-2 text-xs font-bold transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Save & Exit
              </button>
              <div className={`h-4 w-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`} />
              <h1 className="text-xs font-bold truncate max-w-[200px] sm:max-w-md uppercase tracking-wider text-green-600 dark:text-green-500">
                {quiz.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                <Clock className="w-4 h-4 text-green-500" />
                <span className="w-12 font-mono tracking-wider">{formatTime(timeElapsed)}</span>
              </div>
              <div className={`hidden sm:flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isDark ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Proctored
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left: Main Question Area */}
            <div className="lg:col-span-3 flex flex-col">
              <div className={`flex-1 p-6 sm:p-8 rounded-xl border shadow-sm flex flex-col ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                
                <div className="flex items-center justify-between mb-6 border-b pb-4 border-neutral-200 dark:border-neutral-800">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Question {currentQuestionIndex + 1} <span className="mx-1 opacity-50">/</span> {quiz.no_of_questions}
                  </span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-semibold mb-8 leading-relaxed">
                  {currentQuestion.question_text}
                </h2>
                
                <div className="space-y-3 max-w-3xl">
                  {currentQuestion.choices.map((choice: any) => {
                    const isSelected = answers[currentQuestion.id] === choice.id;
                    return (
                      // Notice: We are using a simple div with onClick here for perfect reliability
                      <div 
                        key={choice.id} 
                        onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                        className={`group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? isDark 
                              ? 'bg-green-500/10 border-green-500 text-white' 
                              : 'bg-green-50 border-green-600 text-black' 
                            : isDark 
                              ? 'bg-[#0f0f0f] border-neutral-800 hover:border-neutral-600 text-neutral-300' 
                              : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className={`relative flex items-center justify-center w-5 h-5 rounded-full border shrink-0 mt-0.5 transition-colors duration-150 ${
                          isSelected ? 'border-green-500' : isDark ? 'border-neutral-600 group-hover:border-neutral-400' : 'border-neutral-400 group-hover:border-neutral-500'
                        }`}>
                          {isSelected && <div className="absolute w-2.5 h-2.5 rounded-full bg-green-500" />}
                        </div>
                        <span className="font-medium text-base leading-snug select-none">
                          {choice.choice_text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom: Navigation Controls */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    currentQuestionIndex === 0 
                      ? 'opacity-0 pointer-events-none' 
                      : isDark ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : 'bg-white border hover:bg-neutral-50 text-black'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${
                    currentQuestionIndex === quiz.questions.length - 1
                      ? 'opacity-0 pointer-events-none' 
                      : 'bg-neutral-800 text-white hover:bg-black dark:bg-neutral-200 dark:text-black dark:hover:bg-white'
                  }`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Map & Submit Sidebar */}
            <div className="lg:col-span-1">
              <div className={`sticky top-20 p-5 rounded-xl border shadow-sm flex flex-col h-auto max-h-[calc(100vh-6rem)] ${
                isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
                
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-5">
                  Assessment Map
                </h3>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className={isDark ? 'text-neutral-400' : 'text-neutral-600'}>Progress</span>
                    <span className="text-green-500">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full w-full overflow-hidden ${isDark ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                    <div 
                      className="h-full bg-green-500 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className={`grid grid-cols-1 gap-2.5 mb-5 pb-5 border-b text-[11px] font-bold ${isDark ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded bg-green-600" /> Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded border ${isDark ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-300 bg-neutral-50'}`} /> Pending
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded ring-2 ring-offset-1 ${isDark ? 'bg-green-500/20 ring-green-500 ring-offset-[#0a0a0a]' : 'bg-green-100 ring-green-600 ring-offset-white'}`} /> Current
                  </div>
                </div>
                
                {/* Question Nav Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 mb-6 overflow-y-auto pr-1 custom-scrollbar">
                  {quiz.questions.map((q: any, idx: number) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = currentQuestionIndex === idx;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`relative aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                          // CURRENT
                          isCurrent 
                            ? isDark 
                              ? 'border-2 border-green-500 bg-green-500/10 text-green-400' 
                              : 'border-2 border-green-600 bg-green-50 text-green-700'
                            
                          // ANSWERED
                          : isAnswered
                            ? isDark
                              ? 'bg-green-700 text-white border border-green-600 hover:bg-green-600'
                              : 'bg-green-600 text-white border border-green-700 hover:bg-green-700'
                            
                          // PENDING
                          : isDark 
                            ? 'bg-[#111] border border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300' 
                            : 'bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Block */}
                <div className="mt-auto pt-5 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isComplete}
                    className="w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit Exam
                  </button>
                  
                  {!isComplete && (
                    <p className={`text-[10px] text-center mt-3 font-bold uppercase tracking-wider ${isDark ? 'text-amber-500/80' : 'text-amber-600'}`}>
                      {quiz.no_of_questions - answeredCount} Question(s) Left
                    </p>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}