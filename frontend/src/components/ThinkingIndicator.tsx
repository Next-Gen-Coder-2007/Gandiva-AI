import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThinkingIndicator: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-fit ${
      isDark ? 'bg-zinc-800/50 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
    }`}>
      <div className="relative flex items-center justify-center w-6 h-6">
        <Sparkles className="w-5 h-5 animate-pulse text-green-500" />
        {/* Subtle spinning ring around the sparkle icon */}
        <div className="absolute inset-0 border-2 border-green-500 rounded-full border-t-transparent animate-spin opacity-50" />
      </div>
      <span className="text-sm font-medium animate-pulse tracking-wide">
        Generating next response...
      </span>
    </div>
  );
};

export default ThinkingIndicator;