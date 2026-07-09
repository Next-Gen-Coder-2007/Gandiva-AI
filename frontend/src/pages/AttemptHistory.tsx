import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getQuizById, getAttemptDetails } from '../services/quiz'; // <-- Updated import
import Modal from '../components/Modal'; 
import { 
  Loader2, ArrowLeft, History, Trophy, Clock, Calendar, 
  Target, TrendingUp, XCircle, ChevronLeft, ChevronRight, Eye, Sparkles
} from 'lucide-react';

export default function AttemptHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [attemptDetails, setAttemptDetails] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (id) {
      getQuizById(id)
        .then(res => setQuiz(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050505] text-green-500' : 'bg-neutral-50 text-green-600'}`}>
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`min-h-screen p-8 flex flex-col items-center justify-center font-sans ${isDark ? 'bg-[#050505] text-white' : 'bg-neutral-50 text-black'}`}>
        <XCircle className="w-12 h-12 text-neutral-500 mb-4" />
        <h2 className="text-xl font-bold">Assessment Not Found</h2>
        <button onClick={() => navigate('/quizzes')} className="mt-4 text-green-500 font-medium hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const attempts = quiz.attempts || [];
  const totalMarks = quiz.questions?.reduce((sum: number, q: any) => sum + (q.marks || 1), 0) || 0;
  
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.score)) : 0;
  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / attempts.length) : 0;
  const bestPercentage = totalMarks > 0 ? Math.round((bestScore / totalMarks) * 100) : 0;

  const openModal = async (attemptId: number, attemptIndex: number) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    setAttemptDetails(null);
    setCurrentQuestionIndex(0);

    try {
      const response = await getAttemptDetails(id!, attemptId);
      setAttemptDetails({ ...response.data, attemptNumber: attempts.length - attemptIndex });
    } catch (error) {
      console.error("Failed to fetch attempt details:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setAttemptDetails(null), 200); // Wait for closing animation
  };

  const handleNext = () => {
    if (attemptDetails && currentQuestionIndex < (attemptDetails.responses?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentResponse = attemptDetails?.responses?.[currentQuestionIndex];
  const currentQuestion = quiz.questions?.find((q: any) => q.id === currentResponse?.question_id);
  const isFullMarks = currentResponse?.awarded_marks === currentQuestion?.marks;
  const isWrong = currentResponse?.awarded_marks === 0;

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200 ${isDark ? 'bg-[#050505] text-white' : 'bg-neutral-50 text-black'}`}>
      <div className="max-w-5xl mx-auto space-y-8">        
        <div>
          <button 
            onClick={() => navigate('/quizzes')}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-8 transition-colors ${
              isDark ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-green-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Assessment History
                </h1>
              </div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {quiz.title}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded border ${
                quiz.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                quiz.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                'bg-blue-500/10 text-blue-500 border-blue-500/20'
              }`}>
                {quiz.difficulty}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded border ${
                isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-600'
              }`}>
                {totalMarks} Total Marks
              </span>
            </div>
          </div>
        </div>

        {attempts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <div className="flex items-center gap-3 mb-2 text-green-500">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Attempts Taken</span>
              </div>
              <div className="text-3xl font-black">{attempts.length}</div>
            </div>
            
            <div className={`p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <div className="flex items-center gap-3 mb-2 text-blue-500">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
              </div>
              <div className="text-3xl font-black">
                {avgScore} <span className="text-lg text-neutral-500 font-medium">/ {totalMarks}</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-neutral-800 ring-1 ring-yellow-500/20' : 'bg-white border-neutral-200 ring-1 ring-yellow-500/20'}`}>
              <div className="flex items-center gap-3 mb-2 text-yellow-500">
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Best Score</span>
              </div>
              <div className="text-3xl font-black">
                {bestScore} <span className="text-lg font-medium text-neutral-500">({bestPercentage}%)</span>
              </div>
            </div>
          </div>
        )}

        {attempts.length === 0 ? (
          <div className={`py-24 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed ${isDark ? 'border-neutral-800 bg-[#0a0a0a]/50' : 'border-neutral-300 bg-white/50'}`}>
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-5">
              <Clock className={`w-8 h-8 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
            </div>
            <h3 className="text-xl font-bold mb-2">No Attempts Recorded</h3>
            <p className={`mb-8 max-w-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              You haven't taken this assessment yet. Start now to establish your baseline score.
            </p>
            <button 
              onClick={() => navigate(`/quizzes/${id}/attempt`)}
              className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-md shadow-green-500/20"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-500">Timeline</h3>
              <button 
                onClick={() => navigate(`/quizzes/${id}/attempt`)}
                className="text-xs font-bold text-green-600 dark:text-green-500 hover:underline"
              >
                + Take Again
              </button>
            </div>
            
            {attempts.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map((attempt: any, index: number) => {
              const percentage = totalMarks > 0 ? Math.round((attempt.score / totalMarks) * 100) : 0;
              const date = new Date(attempt.completed_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              });
              const time = new Date(attempt.completed_at).toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div 
                  key={attempt.id} 
                  onClick={() => openModal(attempt.id, index)}
                  className={`flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border cursor-pointer shadow-sm transition-all hover:scale-[1.01] ${
                    isDark ? 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg ring-4 ring-offset-2 ${
                      isDark ? 'ring-offset-[#0a0a0a]' : 'ring-offset-white'
                    } ${
                      percentage >= 80 ? 'bg-green-500/10 text-green-500 ring-green-500/20' :
                      percentage >= 50 ? 'bg-amber-500/10 text-amber-500 ring-amber-500/20' : 
                      'bg-red-500/10 text-red-500 ring-red-500/20'
                    }`}>
                      {percentage}%
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        Attempt {attempts.length - index}
                        {index === 0 && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Latest</span>}
                      </h3>
                      <div className={`flex items-center gap-4 text-xs font-semibold mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 mb-0.5">Marks Earned</span>
                      <span className="font-black text-xl leading-none">
                        {attempt.score} <span className="text-neutral-500 text-sm font-semibold">/ {totalMarks}</span>
                      </span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${
                      isDark ? 'bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                    }`}>
                      <Eye className="w-4 h-4" /> Review
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={attemptDetails ? `Reviewing Attempt ${attemptDetails.attemptNumber}` : 'Loading...'}
      >
        {isModalLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px]">
            <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-green-500' : 'text-green-600'}`} />
            <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Loading responses...</p>
          </div>
        ) : attemptDetails && currentQuestion ? (
          <div className="flex flex-col min-h-[300px]">
            
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                Question {currentQuestionIndex + 1} of {attemptDetails.responses.length}
              </span>
              <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isFullMarks ? 'bg-green-500/10 text-green-500' :
                  isWrong ? 'bg-red-500/10 text-red-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {isFullMarks ? 'Correct' : isWrong ? 'Wrong' : 'Partial'}
              </div>
            </div>

            <div className="flex-1 mb-6">
              <h3 className={`text-lg font-semibold leading-relaxed mb-4 ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>
                {currentQuestion.question_text}
              </h3>
              
              <div className={`inline-block px-3 py-2 rounded-lg border text-sm font-bold ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                Marks Awarded: <span className={
                  isFullMarks ? 'text-green-500' : isWrong ? 'text-red-500' : 'text-amber-500'
                }>{currentResponse.awarded_marks}</span> 
                <span className="text-neutral-500"> / {currentQuestion.marks}</span>
              </div>

              {currentResponse.feedback && (
                <div className={`mt-4 p-4 rounded-xl border flex gap-3 ${
                  isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-100' : 'bg-blue-50 border-blue-100 text-blue-900'
                }`}>
                  <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <span className={`block text-[10px] uppercase font-bold mb-1 tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      AI Grader Notes
                    </span>
                    <p className="text-sm font-medium leading-relaxed">{currentResponse.feedback}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentQuestionIndex === 0 
                    ? 'opacity-30 cursor-not-allowed' 
                    : isDark ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-xs font-bold text-neutral-500">
                {currentQuestionIndex + 1} / {attemptDetails.responses.length}
              </span>

              <button 
                onClick={handleNext}
                disabled={currentQuestionIndex === attemptDetails.responses.length - 1}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentQuestionIndex === attemptDetails.responses.length - 1 
                    ? 'opacity-30 cursor-not-allowed' 
                    : isDark ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        ) : (
          <div className="py-10 text-center text-neutral-500 text-sm">
            No question data available for this attempt.
          </div>
        )}
      </Modal>

    </div>
  );
}