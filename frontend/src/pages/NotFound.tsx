import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCompass } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { isDark } = useTheme();

  return (
    <div className={`relative flex flex-col items-center justify-center w-full min-h-screen px-6 overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div 
        className={`absolute top-10 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-[80px] animate-pulse ${isDark ? 'bg-green-500/10' : 'bg-green-400/20'}`} 
        style={{ animationDuration: '4s' }}
      ></div>
      <div 
        className={`absolute bottom-10 right-10 w-72 h-72 rounded-full mix-blend-screen filter blur-[80px] animate-pulse ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'}`} 
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      ></div>
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        <div className={`relative flex items-center justify-center w-24 h-24 mb-8 rounded-full shadow-lg backdrop-blur-md ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-100'} border`}>
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-green-500/80 animate-spin" style={{ animationDuration: '3s' }}></div>
          <FaCompass className={`w-10 h-10 animate-pulse ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`} />
        </div>

        <h1 className="text-8xl md:text-[150px] font-black tracking-tighter mb-4 leading-none select-none">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-700 drop-shadow-sm">
            404
          </span>
        </h1>
        
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          You've ventured too far.
        </h2>
        
        <p className={`text-base md:text-lg mb-10 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          The resource you are looking for has been moved, removed, or doesn't exist. Let's guide you back to safety.
        </p>

        {/* Premium Animated Button */}
        <Link 
          to="/" 
          className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden
            ${isDark 
              ? 'bg-zinc-900 border border-zinc-800 text-white hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]' 
              : 'bg-white border border-zinc-200 text-zinc-900 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]'
            }`}
        >
          {/* Button Hover Sweep Effect */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
          
          <FaArrowLeft className="relative w-4 h-4 text-green-500 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="relative">Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;