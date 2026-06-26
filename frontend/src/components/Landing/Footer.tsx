import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t pt-16 pb-8 font-sans transition-colors duration-300 ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          <div className="text-center md:text-left max-w-sm">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <img src='/logo.png' className='w-6 h-6'/>
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Gandiva AI</span>
            </Link>
            <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              An open, free platform built by a solo developer to help students bridge the gap between college and their dream placements.
            </p>
          </div>

          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-400/50' : 'bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-green-500 hover:border-green-400/50'}`}>
              <FaGithub className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-green-400 hover:border-green-400/50' : 'bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-green-500 hover:border-green-400/50'}`}>
              <FaLinkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${isDark ? 'border-zinc-900 text-zinc-600' : 'border-zinc-200 text-zinc-500'}`}>
          <p>© {new Date().getFullYear()} Gandiva AI. Free and built for the community.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className={`transition-colors ${isDark ? 'hover:text-zinc-400' : 'hover:text-zinc-700'}`}>Privacy Policy</Link>
            <Link to="/terms" className={`transition-colors ${isDark ? 'hover:text-zinc-400' : 'hover:text-zinc-700'}`}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;