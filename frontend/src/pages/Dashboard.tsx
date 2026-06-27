import React, { useState } from 'react';
import { LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth'; 

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-green-500/20 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full blur-[80px] pointer-events-none ${isDark ? 'bg-green-400/10' : 'bg-green-400/20'}`}></div>
      <div className={`relative z-10 w-full max-w-md p-6 sm:p-10 rounded-3xl shadow-2xl ${isDark ? 'bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl' : 'bg-white/90 border border-zinc-200 backdrop-blur-xl'}`}>
        
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-6 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <UserIcon className="w-12 h-12" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome, {user?.username || 'User'}!
          </h1>
          
          <div className={`flex items-center justify-center gap-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Mail className="w-4 h-4" />
            <span>{user?.email || 'Loading email...'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full py-3.5 rounded-xl border font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
            isDark 
              ? 'bg-zinc-900 border-red-900/50 hover:bg-red-950/40 hover:border-red-900 text-red-400' 
              : 'bg-white border-red-200 hover:bg-red-50 text-red-500'
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
        
      </div>
    </div>
  );
};

export default Dashboard;