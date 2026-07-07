import React, { useState } from 'react';
import { Sparkles, TrendingUp, Plus, Target, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal'; 

interface QuizStat {
  label: string;
  value: string | number;
}

interface QuizItem {
  id: string;
  title: string;
  score: number;
  lastAttempted: string;
}

const Quizzes: React.FC = () => {
  const { isDark } = useTheme();
  const [stats] = useState<QuizStat[]>([]);
  const [history] = useState<QuizItem[]>([]);

  // Modal and Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState<number | ''>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !questionCount) return;

    setIsGenerating(true);
    
    // Simulate an API call to generate the AI quiz
    setTimeout(() => {
      console.log('Generating Quiz:', { topic, difficulty, questionCount });
      setIsGenerating(false);
      setIsModalOpen(false);
      setTopic(''); // Reset form
      setDifficulty('medium');
      setQuestionCount(5);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Quiz Center</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Challenge your knowledge with AI-generated quizzes and track your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Generate New Quiz</h2>
            <p className={`max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Create a custom quiz on any topic to test your technical skills and track progress.
            </p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-green-600 text-white hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Performance Analytics
          </h2>
          {stats.length > 0 ? (
            <div className="space-y-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{stat.label}</span>
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-sm p-4 rounded-xl border border-dashed ${isDark ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400'}`}>
              Performance insights will appear here once you complete your first quiz.
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <h2 className="text-lg font-bold mb-6">Recent Attempts</h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Map through history items here */}
          </div>
        ) : (
          <div className={`py-16 flex flex-col items-center justify-center text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <Target className="w-12 h-12 mb-3 opacity-20" />
            <p>No quiz attempts yet. Generate a quiz to start testing your knowledge!</p>
          </div>
        )}
      </div>

      {/* Generate Quiz Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create AI Quiz">
        <form onSubmit={handleGenerateQuiz} className="space-y-5">
          
          {/* Topic Input */}
          <div className="space-y-2">
            <label htmlFor="topic" className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Quiz Topic
            </label>
            <input
              id="topic"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., React Hooks, World War II..."
              className={`w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty Select */}
            <div className="space-y-2">
              <label htmlFor="difficulty" className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-white' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              >
                <option value="beginner">Beginner</option>
                <option value="medium">Intermediate</option>
                <option value="hard">Expert</option>
              </select>
            </div>

            {/* Custom Question Count Input */}
            <div className="space-y-2">
              <label htmlFor="count" className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Questions (Max 50)
              </label>
              <input
                id="count"
                type="number"
                min="1"
                max="50"
                required
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value ? Number(e.target.value) : '')}
                className={`w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDark 
                    ? 'bg-zinc-900 border-zinc-800 text-white' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating || !topic.trim() || !questionCount}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Quizzes;