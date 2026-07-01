import React from 'react';
import { MessageSquare, Sparkles, TrendingUp, History, Play, BrainCircuit } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Interviews: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Mock Interview</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Practice real-time technical communication with our AI interviewer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Start a New Interview</h2>
            <p className={`max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Generate a personalized mock interview based on your career goals. 
              (Custom parameters available in the next update)
            </p>
            
            <button className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-white' 
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}>
              <Play className="w-4 h-4 fill-current" />
              Generate Interview
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" /> Performance
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Avg. Score</span>
                <span className="font-bold">74/100</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> AI Suggestions
            </h2>
            <div className="space-y-2">
              {['System Design', 'Behavioral'].map((s) => (
                <div key={s} className="text-sm px-3 py-2 rounded-lg bg-zinc-500/5 hover:bg-zinc-500/10 cursor-pointer transition-colors">
                  {s} Interview
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-zinc-400" /> Interview History
        </h2>
        <div className={`py-12 flex flex-col items-center justify-center text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          <BrainCircuit className="w-12 h-12 mb-3 opacity-20" />
          <p>Your session history will appear here once you complete your first interview.</p>
        </div>
      </div>
    </div>
  );
};

export default Interviews;