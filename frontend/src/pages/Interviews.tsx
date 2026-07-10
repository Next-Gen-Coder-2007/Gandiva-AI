import React, { useState } from 'react';
import { MessageSquare, Sparkles, TrendingUp, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';

const Interviews: React.FC = () => {
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bgCard = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Mock Interview</h1>
        <p className={`mt-1 ${textMuted}`}>Practice real-time technical communication with our AI interviewer.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${bgCard}`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-green-950/30' : 'bg-green-50'}`}>
              <MessageSquare className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Start a New Interview</h2>
            <p className={`max-w-md mb-8 ${textMuted}`}>Generate a personalized mock interview based on your career goals.</p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate Interview
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${bgCard}`}>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> Performance
            </h2>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${textMuted}`}>Avg. Score</span>
              <span className="font-bold text-green-600">74/100</span>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${bgCard}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" /> AI Suggestions
            </h2>
            <div className="space-y-2">
              {['System Design', 'Behavioral'].map((s) => (
                <div key={s} className="text-sm px-3 py-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 cursor-pointer transition-colors">
                  {s} Interview
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Interview">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Target Role</label>
          <input 
            type="text" 
            placeholder="e.g. Senior Frontend Dev" 
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
          />
          <button className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700">
            Start Interview
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Interviews;