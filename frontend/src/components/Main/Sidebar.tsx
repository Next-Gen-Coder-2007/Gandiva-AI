import React, { useEffect } from 'react'; // Added useEffect
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  BrainCircuit, 
  MessageSquare, 
  Map, 
  Briefcase, 
  X,
  Settings,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { isDark } = useTheme();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Resume Builder', path: '/resume-builder', icon: FileText },
    { name: 'AI Resume Analyzer', path: '/resume-analyzer', icon: Search },
    { name: 'AI Quizzes', path: '/quizzes', icon: BrainCircuit },
    { name: 'AI Mock Interview', path: '/interviews', icon: MessageSquare },
    { name: 'AI Roadmaps', path: '/roadmaps', icon: Map },
    { name: 'Internships & Jobs', path: '/internships', icon: Briefcase },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col border-r ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isDark ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-100' : 'bg-white/90 border-zinc-200 text-zinc-900'} backdrop-blur-xl`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-inherit shrink-0">
          <div className="flex items-center gap-2">
            <img src="./logo.png" alt="logo" className='w-6 h-6' />
            <span className="text-xl font-extrabold tracking-tight">Gandiva<span className="text-green-500">AI</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-zinc-500/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors duration-200 ${
                  isActive
                    ? isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
                    : isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-inherit' : 'opacity-70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className={`px-4 py-4 border-t shrink-0 ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'}`}>
          <div className="space-y-1">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors duration-200 ${
                location.pathname === '/settings'
                  ? isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'text-inherit' : 'opacity-70'}`} />
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors duration-200 ${
                isDark 
                  ? 'text-red-400 hover:bg-red-500/10' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5 opacity-70" />
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;