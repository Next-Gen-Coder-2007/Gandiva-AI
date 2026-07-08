import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getQuizById } from '../services/quiz';
import { Loader2, ArrowLeft, History, Trophy, Clock, Calendar } from 'lucide-react';

export default function AttemptHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-green-500' : 'bg-white text-green-600'}`}>
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`min-h-screen p-8 text-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <h2>Assessment not found</h2>
      </div>
    );
  }

  const attempts = quiz.attempts || [];
  const maxScore = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.score)) : 0;
  
  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <button 
          onClick={() => navigate('/quizzes')}
          className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessments
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-green-500" />
              History: {quiz.title}
            </h1>
            <p className={`mt-2 font-medium flex items-center gap-3 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              <span className="capitalize text-xs font-bold bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded">
                {quiz.difficulty}
              </span>
              <span>{quiz.no_of_questions} Total Questions</span>
            </p>
          </div>
          
          {attempts.length > 0 && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-neutral-500">Best Score</span>
                <span className="text-lg font-black leading-none">{maxScore} / {quiz.no_of_questions}</span>
              </div>
            </div>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className={`py-20 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed ${isDark ? 'border-neutral-800' : 'border-neutral-300'}`}>
            <Clock className={`w-12 h-12 mb-4 ${isDark ? 'text-neutral-700' : 'text-neutral-300'}`} />
            <p className="text-xl font-bold mb-2">No attempts yet</p>
            <p className={`mb-6 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>You haven't taken this assessment yet.</p>
            <button 
              onClick={() => navigate(`/quizzes/${id}/attempt`)}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {attempts.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map((attempt: any, index: number) => {
              const percentage = Math.round((attempt.score / quiz.no_of_questions) * 100);
              const date = new Date(attempt.completed_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              });
              const time = new Date(attempt.completed_at).toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div 
                  key={attempt.id} 
                  className={`flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-[#0a0a0a] border-neutral-800 hover:border-green-500/30' : 'bg-white border-neutral-200 hover:border-green-500/40'
                  }`}
                >
                  <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                      percentage >= 80 ? 'bg-green-500/10 text-green-500' :
                      percentage >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {percentage}%
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Attempt {attempts.length - index}</h3>
                      <div className={`flex items-center gap-4 text-xs font-medium mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-lg border flex flex-col items-end ${
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 mb-1">Score</span>
                    <span className="font-black text-lg">
                      {attempt.score} <span className="text-neutral-500 text-sm font-medium">/ {quiz.no_of_questions}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}