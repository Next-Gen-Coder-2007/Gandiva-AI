import { Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { lenisInstance as lenis } from '../../hooks/useLenis';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b font-sans transition-colors duration-300 ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <button
          onClick={() => lenis?.scrollTo(0)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <img src='/logo.png' className="w-8 h-8 group-hover:animate-pulse" />
          <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Gandiva AI</span>
        </button>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <button
            onClick={() => lenis?.scrollTo("#features")}
            className="hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            Features
          </button>
          <a href="#roadmap" className="hover:text-green-500 transition-colors">Roadmaps</a>
          <a href="#practice" className="hover:text-green-500 transition-colors">Mock Interviews</a>
          <a href="#about" className="hover:text-green-500 transition-colors">About</a>
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

          <Link
            to="/login"
            className={`
              hidden md:block px-6 py-2 rounded-full text-sm font-semibold
              border border-green-500
              transition-all duration-300
              hover:shadow-[0_0_18px_rgba(34,197,94,0.45)]
              active:scale-[0.98]
              ${
                isDark
                  ? 'bg-zinc-900 text-zinc-200'
                  : 'bg-white text-zinc-700'
              }
            `}
          >
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