import React from 'react';
import { Map, Sparkles, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Roadmaps: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Career Roadmaps</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Generate personalized, step-by-step learning paths based on your career targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <Map className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create New Roadmap</h2>
            <p className={`max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Define your career goal and let our AI architect a customized curriculum to get you there.
            </p>
            
            <button className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
              isDark 
                ? 'bg-zinc-100 text-zinc-950 hover:bg-white' 
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}>
              <Sparkles className="w-4 h-4" />
              Generate Roadmap
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" /> Your Current Goals
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-dashed border-zinc-500/20 text-center">
              <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No active roadmaps found.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <h2 className="text-lg font-bold mb-6">Generated Path Preview</h2>
        
        <div className="space-y-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex gap-4 items-start">
              <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center font-bold border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
                {step}
              </div>
              <div className={`flex-1 p-4 rounded-xl border ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                <h4 className="font-semibold">Roadmap Phase {step}</h4>
                <p className={`text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  AI generated content for this phase will be displayed here once you generate a roadmap.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;