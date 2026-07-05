import { useState } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { lenisInstance as lenis } from '../../hooks/useLenis';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleScrollTo = (target: any) => {
    lenis?.scrollTo(target);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-md border-b font-sans transition-colors duration-300 ${isDark ? 'bg-black/80 border-white/5' : 'bg-white/80 border-zinc-200'}`}>
      <div className="flex items-center justify-between px-6 py-4 md:px-6 md:py-4 max-w-7xl mx-auto">
        
        <button
          onClick={() => handleScrollTo(0)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <img src='/logo.png' alt="Gandiva AI Logo" className="w-8 h-8 group-hover:animate-pulse" />
          <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Gandiva AI</span>
        </button>

        <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <button
            onClick={() => handleScrollTo(0)}
            className="hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            Home
          </button>
          <button
            onClick={() => handleScrollTo("#features")}
            className="hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            Features
          </button>
          <button
            onClick={() => handleScrollTo("#techstack")}
            className="hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            Tech Stack
          </button>
          <button
            onClick={() => handleScrollTo("#contact")}
            className="hover:text-green-500 transition-colors cursor-pointer bg-transparent border-none"
          >
            Contact Us
          </button>
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

          {/* Desktop Login Button */}
          <Link
            to="/login"
            className={`
              hidden md:block px-6 py-2 rounded-full text-sm font-semibold
              border border-green-500
              transition-all duration-300
              hover:shadow-[0_0_18px_rgba(34,197,94,0.45)]
              active:scale-[0.98]
              ${isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-zinc-700'}
            `}
          >
            Login
          </Link>
          
          <Link 
            to="/register" 
            className="hidden md:flex bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
          >
            Register
          </Link>

          <button
            onClick={toggleMobileMenu}
            className={`md:hidden flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'}`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full border-b backdrop-blur-xl transition-colors duration-300 ${isDark ? 'bg-black/95 border-white/5' : 'bg-white/95 border-zinc-200'}`}>
          <div className="flex flex-col px-6 py-6 gap-6 text-base font-medium">
            <button
              onClick={() => handleScrollTo(0)}
              className={`text-left hover:text-green-500 transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleScrollTo("#features")}
              className={`text-left hover:text-green-500 transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo("#techstack")}
              className={`text-left hover:text-green-500 transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              Tech Stack
            </button>
            <button
              onClick={() => handleScrollTo("#contact")}
              className={`text-left hover:text-green-500 transition-colors ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              Contact Us
            </button>
            
            <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800 my-2"></div>
            
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-center py-3 rounded-full text-sm font-semibold border border-green-500 transition-all ${isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-zinc-700'}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-3 rounded-full text-sm font-bold bg-green-500 hover:bg-green-400 text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;