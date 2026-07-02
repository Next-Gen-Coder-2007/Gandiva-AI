import React, { useState } from 'react';
import { Sparkles, TrendingUp, Plus, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
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
            {/* Map your quiz history items here */}
          </div>
        ) : (
          <div className={`py-16 flex flex-col items-center justify-center text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <Target className="w-12 h-12 mb-3 opacity-20" />
            <p>No quiz attempts yet. Generate a quiz to start testing your knowledge!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;