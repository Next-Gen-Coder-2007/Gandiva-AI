import React from 'react';
import { FileText, Wand2, CheckCircle2, ChevronRight, LayoutTemplate, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ResumeBuilder: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Resume Builder</h1>
          <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Craft a high-impact, ATS-friendly resume with AI assistance.
          </p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
          <Zap className="w-4 h-4" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Builder Sections Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {['Personal Info', 'Experience', 'Education', 'Skills', 'Projects'].map((section, idx) => (
            <button key={section} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              idx === 0 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <span className="font-medium">{section}</span>
              <CheckCircle2 className={`w-4 h-4 ${idx === 0 ? 'opacity-100' : 'opacity-20'}`} />
            </button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="text-xl font-bold mb-6">Experience</h2>
            <div className="space-y-6">
              {/* This is where your form inputs will go */}
              <div className="p-12 border-2 border-dashed border-zinc-500/20 rounded-2xl flex flex-col items-center text-center">
                <FileText className="w-12 h-12 text-zinc-400 mb-4 opacity-50" />
                <h3 className="font-bold">No experience added yet</h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Click below to generate experience bullet points with AI.
                </p>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold">
                  <Wand2 className="w-4 h-4" /> Generate with AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time ATS/Score Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h3 className="font-bold mb-4">ATS Optimization</h3>
            <div className="text-center py-6">
              <div className="text-4xl font-extrabold text-green-500">85/100</div>
              <p className={`text-sm mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Strong Match</p>
            </div>
            <div className="space-y-2 text-sm">
              <p>✓ Strong action verbs</p>
              <p>✓ Quantifiable metrics</p>
              <p className="opacity-50">✗ Missing keywords</p>
            </div>
          </div>
          
          <button className={`w-full p-4 rounded-xl border flex items-center justify-center gap-2 font-semibold ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <LayoutTemplate className="w-4 h-4" /> Change Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;