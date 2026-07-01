import React, { useState } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface QuizStat {
  label: string;
  value: string | number;
}

interface CourseHistoryItem {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
}

const Quizzes: React.FC = () => {
  const { isDark } = useTheme();
  const [stats] = useState<QuizStat[]>([]); 
  const [history] = useState<CourseHistoryItem[]>([]); 

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Course Center</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Generate personalized learning paths and technical courses powered by AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create New AI Course</h2>
            <p className={`max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Design a custom curriculum tailored to your career goals and current skill level.
            </p>
            
            <button 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Learning Analytics
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
              Learning insights will appear here once you start your first course.
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <h2 className="text-lg font-bold mb-6">Your Courses</h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          </div>
        ) : (
          <div className={`py-16 flex flex-col items-center justify-center text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
            <p>No active courses. Create your first one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;