import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getInterview, startInterview, submitAnswer, evaluateInterview } from '../services/interview';

const InterviewSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const bgColor = isDark ? 'bg-black' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getInterview(Number(id));
        setSession(data);
        
        // Find the first unanswered question
        const firstUnanswered = data.questions.findIndex((q: any) => !q.answer);
        if (firstUnanswered !== -1) {
          setCurrentQuestionIndex(firstUnanswered);
          if (data.status === 'pending') {
            await startInterview(Number(id));
          }
        } else if (data.status === 'completed') {
          navigate(`/interviews/feedback/${id}`);
        } else {
          // All answered, but not evaluated
          triggerEvaluation();
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  // Simple Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = async () => {
    if (!answerText.trim() && !window.confirm("Are you sure you want to skip this question?")) return;
    
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
    <div className={`min-h-screen flex flex-col font-sans ${bgColor} ${textColor}`}>
      
      {/* Top Navbar */}
      <header className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-white'}`}>
        <div>
          <h1 className="font-bold text-lg">{session.role} Interview</h1>
          <p className={`text-xs font-medium uppercase tracking-wider ${secondaryText}`}>
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm border ${isDark ? 'bg-zinc-900 border-zinc-800 text-green-400' : 'bg-zinc-100 border-zinc-200 text-green-600'}`}>
          <Clock className="w-4 h-4" /> {formatTime(timeSpent)}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-800">
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
              onClick={handleNext}
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
    </div>
  );
};

export default InterviewSession;