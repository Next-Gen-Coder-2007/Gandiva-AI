import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AudioVisualizerProps {
  isActive: boolean;
  variant?: 'ai' | 'candidate';
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, variant = 'ai' }) => {
  const { isDark } = useTheme();

  // Theme colors based on variant
  const activeColor = variant === 'ai' ? 'bg-green-500' : 'bg-blue-500';
  const inactiveColor = isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const baseColor = isActive ? activeColor : inactiveColor;

  return (
    <div className="flex items-center justify-center gap-1 h-8 w-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-200 ${baseColor} ${
            isActive ? 'animate-wave' : 'h-1.5'
          }`}
          style={{
            animationDelay: isActive ? `${i * 0.15}s` : '0s',
            // Default heights for the animation base
            height: isActive ? '100%' : '6px',
          }}
        />
      ))}
      
      {/* Note: You will need to add this custom animation to your tailwind.config.js:
        theme: {
          extend: {
            keyframes: {
              wave: {
                '0%, 100%': { height: '20%' },
                '50%': { height: '100%' },
              }
            },
            animation: {
              wave: 'wave 1.2s ease-in-out infinite',
            }
          }
        }
      */}
    </div>
  );
};

export default AudioVisualizer;