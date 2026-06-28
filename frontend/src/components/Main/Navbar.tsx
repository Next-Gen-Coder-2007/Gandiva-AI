import React from 'react';
import { Menu, Moon, Sun, Bell, Trophy, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300 ${
      isDark 
        ? 'bg-zinc-950/80 border-zinc-800/80 text-zinc-100' 
        : 'bg-white/80 border-zinc-200 text-zinc-900'
    }`}>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)} 
          aria-label="Open Sidebar"
          className={`p-2 rounded-xl lg:hidden transition-all duration-200 active:scale-95 ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        
        <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-300 hover:shadow-md cursor-default ${
          isDark 
            ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
            : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
        }`}>
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold tracking-tight">Placement Score: 81/100</span>
        </div>

        <button 
          onClick={toggleTheme} 
          aria-label="Toggle Theme"
          className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          aria-label="Notifications"
          className={`relative p-2 rounded-full transition-all duration-200 active:scale-95 ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 ${
            isDark ? 'bg-green-500 border-zinc-950' : 'bg-green-500 border-white'
          }`}></span>
        </button>

        <div className={`h-6 w-px mx-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>

        <button className={`flex items-center gap-2 p-1 pr-2 rounded-full transition-colors active:scale-95 ${
          isDark ? 'hover:bg-zinc-800/80' : 'hover:bg-zinc-100'
        }`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center shadow-inner">
            <span className="font-bold text-sm text-white drop-shadow-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 hidden sm:block ${
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          }`} />
        </button>
        
      </div>
    </header>
  );
};

export default Navbar;