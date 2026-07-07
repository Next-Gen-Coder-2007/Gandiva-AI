import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, PlusCircle, Target, Loader2, Trash2, 
  BookOpen, BarChart, AlertCircle, ChevronRight, Clock 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal'; 
import { createQuiz, getAllQuizzes, deleteQuiz } from '../services/quiz';

interface QuizStat {
  label: string;
  value: string | number;
}

interface QuizItem {
  id: number;
  title: string;
  difficulty: string;
  no_of_questions: number;
  created_at?: string; 
}

const Quizzes: React.FC = () => {
  const { isDark } = useTheme();
  
  const [stats, setStats] = useState<QuizStat[]>([]);
  const [history, setHistory] = useState<QuizItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState<number | ''>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await getAllQuizzes();
      const fetchedQuizzes = response.data || [];
      setHistory(fetchedQuizzes);
      
      if (fetchedQuizzes.length > 0) {
        setStats([
          { label: 'Total Assessments', value: fetchedQuizzes.length },
          { label: 'Average Score', value: '85%' }
        ]);
      } else {
        setStats([]);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    
    if (!topic.trim() || !questionCount) {
      setCreateError("Please fill out all required fields.");
      return;
    }
    
    setIsGenerating(true);
    try {
      await createQuiz({
        title: topic.trim(),
        difficulty: difficulty,
        no_of_questions: Number(questionCount) 
      });
      
      setTopic('');
      setDifficulty('medium');
      setQuestionCount(5);
      setIsCreateModalOpen(false);
      
      await fetchQuizzes();
    } catch (error: any) {
      const backendError = error.response?.data?.detail;
      if (Array.isArray(backendError)) {
        setCreateError(`Validation Error: ${backendError[0]?.msg}`);
      } else if (typeof backendError === 'string') {
        setCreateError(backendError);
      } else {
        setCreateError("Failed to generate assessment. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteQuiz(quizToDelete);
      
      setHistory((prev) => prev.filter((quiz) => quiz.id !== quizToDelete));
      setStats((prev) => prev.map(stat => 
        stat.label === 'Total Assessments' ? { ...stat, value: history.length - 1 } : stat
      ));
      
      setQuizToDelete(null);
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      alert("Failed to delete the assessment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyStyles = (level: string) => {
    switch(level.toLowerCase()) {
      case 'hard': return isDark ? 'text-red-400' : 'text-red-600';
      case 'medium': return isDark ? 'text-amber-400' : 'text-amber-600';
      case 'easy': return isDark ? 'text-green-400' : 'text-green-600';
      default: return isDark ? 'text-neutral-400' : 'text-neutral-600';
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Assessment Center</h1>
            <p className={`mt-2 font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Generate, manage, and track intelligent technical assessments.
            </p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-sm hover:shadow-green-900/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Assessment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md ${
            isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Generate AI Assessment</h2>
              </div>
              <p className={`text-sm leading-relaxed font-medium mt-2 max-w-xl ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Leverage AI to instantly create technical quizzes tailored to your specific parameters.
              </p>
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all ${
                isDark 
                  ? 'bg-neutral-900 text-white border border-neutral-700 hover:bg-neutral-800 hover:border-green-500/50' 
                  : 'bg-white text-black border border-neutral-300 hover:bg-neutral-50 hover:border-green-600'
              }`}
            >
              Start Generating <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className={`p-6 rounded-2xl border flex flex-col justify-center ${
            isDark ? 'bg-[#0a0a0a] border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <h2 className="text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-neutral-500">
              <TrendingUp className="w-4 h-4 text-green-500" /> Metrics
            </h2>
            {stats.length > 0 ? (
              <div className="space-y-4">
                {stats.map((stat, i) => (
                  <div key={i} className={`flex justify-between items-end border-b pb-2 ${isDark ? 'border-neutral-800' : 'border-neutral-100'}`}>
                    <span className={`text-sm font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{stat.label}</span>
                    <span className="font-black text-xl tracking-tighter text-green-500">{stat.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`flex items-center justify-center text-xs p-4 rounded-xl border border-dashed text-center font-medium ${
                isDark ? 'border-neutral-800 text-neutral-500' : 'border-neutral-300 text-neutral-400'
              }`}>
                Metrics populate after first attempt.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
            <BookOpen className="w-5 h-5 text-green-500" /> Recent Assessments
          </h2>
          
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {history.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDark 
                      ? 'bg-[#0a0a0a] border-neutral-800 hover:border-green-500/30' 
                      : 'bg-white border-neutral-200 hover:border-green-500/40 hover:shadow-green-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-xl border ${
                      isDark ? 'bg-neutral-900 border-neutral-800 text-green-400' : 'bg-green-50 border-green-100 text-green-600'
                    }`}>
                      <Target className="w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setQuizToDelete(quiz.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'text-neutral-400 hover:text-red-400 hover:bg-red-500/10' : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete Assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="font-bold text-base leading-tight truncate mb-4" title={quiz.title}>
                      {quiz.title}
                    </h3>

                    <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${
                      isDark ? 'border-neutral-800' : 'border-neutral-100'
                    }`}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex items-center gap-1">
                          <BarChart className="w-3 h-3" /> Level
                        </span>
                        <span className={`text-xs font-bold capitalize truncate ${getDifficultyStyles(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Details
                        </span>
                        <span className={`text-xs font-medium truncate ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {quiz.no_of_questions} Questions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed ${
              isDark ? 'border-neutral-800' : 'border-neutral-300'
            }`}>
              <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-lg font-bold mb-1">No history found</p>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Your generated assessments will appear here.
              </p>
            </div>
          )}
        </div>

        <Modal isOpen={isCreateModalOpen} onClose={() => !isGenerating && setIsCreateModalOpen(false)} title="New Assessment Configuration">
          <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-4">
            
            {createError && (
              <div className={`p-3 rounded-lg flex items-start gap-2 border ${
                isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{createError}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="topic" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Assessment Topic
              </label>
              <input
                id="topic"
                type="text"
                required
                autoFocus
                disabled={isGenerating}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., System Design, React Performance..."
                className={`w-full px-4 py-2.5 rounded-lg border outline-none ${
                  isDark 
                    ? 'bg-[#0a0a0a] border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-600 disabled:opacity-50' 
                    : 'bg-white border-neutral-200 text-black placeholder-neutral-400 focus:border-neutral-400 disabled:opacity-50'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="difficulty" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  disabled={isGenerating}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none appearance-none ${
                    isDark 
                      ? 'bg-[#0a0a0a] border-neutral-800 text-white focus:border-neutral-600 disabled:opacity-50' 
                      : 'bg-white border-neutral-300 text-black focus:border-neutral-400 disabled:opacity-50'
                  }`}
                >
                  <option value="easy">Beginner</option>
                  <option value="medium">Intermediate</option>
                  <option value="hard">Expert</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="count" className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Questions (Max 50)
                </label>
                <input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  required
                  disabled={isGenerating}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value ? Number(e.target.value) : '')}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none ${
                    isDark 
                      ? 'bg-[#0a0a0a] border-neutral-800 text-white focus:border-neutral-600 disabled:opacity-50' 
                      : 'bg-white border-neutral-300 text-black focus:border-neutral-400 disabled:opacity-50'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Assessment
                </>
              )}
            </button>
          </form>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal isOpen={!!quizToDelete} onClose={() => !isDeleting && setQuizToDelete(null)} title="Delete Assessment">
          <div className="flex flex-col gap-6">
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${isDark ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Confirm Deletion</h3>
                <p className={`mt-1 text-sm leading-relaxed font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  This action is permanent and will erase all data associated with this assessment. Are you sure you want to proceed?
                </p>
              </div>
            </div>
            
            <div className={`flex justify-end gap-3 pt-4 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setQuizToDelete(null)}
                className={`px-5 py-2.5 rounded-lg font-bold transition-colors border ${
                  isDark 
                    ? 'border-neutral-700 hover:bg-neutral-800 text-neutral-300' 
                    : 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-lg font-bold transition-colors bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
            
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Quizzes;