import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b font-sans transition-colors duration-300 ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <img src='/logo.png' className="w-8 h-8 group-hover:animate-pulse" />
          <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Gandiva AI</span>
        </Link>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <Link to="#features" className="hover:text-green-500 transition-colors">Features</Link>
          <Link to="#roadmap" className="hover:text-green-500 transition-colors">Roadmaps</Link>
          <Link to="#practice" className="hover:text-green-500 transition-colors">Mock Interviews</Link>
          <Link to="#about" className="hover:text-green-500 transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-green-400 hover:text-green-400' : 'border-zinc-200 bg-white text-zinc-700 hover:border-green-400 hover:text-green-500'}`}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link to="/login" className={`hidden text-sm font-medium transition-colors md:block ${isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-zinc-900'}`}>
            Login
          </Link>
          <Link to="/register" className="bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;