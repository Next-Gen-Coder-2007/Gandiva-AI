import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, ChevronRight, Zap, Code2, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Hero = () => {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`relative overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* Custom Keyframes for Continuous Floating */}
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(-10px) rotate(-6deg); }
          50% { transform: translateY(10px) rotate(-4deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(15px) rotate(4deg); }
          50% { transform: translateY(-15px) rotate(6deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(-12px) rotate(3deg); }
          50% { transform: translateY(12px) rotate(1deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(10px) rotate(2deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(-15px) rotate(-4deg); }
          50% { transform: translateY(15px) rotate(-2deg); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(-5px); }
          50% { transform: translateY(5px); }
        }
        
        .anim-float-orb { animation: float-orb 8s ease-in-out infinite; }
        .anim-float-1 { animation: float-1 5s ease-in-out infinite; }
        .anim-float-2 { animation: float-2 6s ease-in-out infinite 1s; }
        .anim-float-3 { animation: float-3 5.5s ease-in-out infinite 0.5s; }
        .anim-float-4 { animation: float-4 4.5s ease-in-out infinite 1.5s; }
        .anim-float-5 { animation: float-5 7s ease-in-out infinite; }
        .anim-float-icon { animation: float-icon 3s ease-in-out infinite; }
      `}</style>

      {/* Parallax Background Grid */}
      <div 
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] opacity-60 transition-transform duration-75 ease-out"
      />
      
      {/* Animated Parallax Glow Orb */}
      {/* Note: The orb uses fixed positioning math natively in CSS, so parallax is applied to a wrapper */}
      <div 
        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none transition-transform duration-75 ease-out"
      >
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] anim-float-orb" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center py-24 px-4 min-h-[calc(100vh-80px)]">
        
        {/* Central Logo / Pulse Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transition-all duration-1000 ${isDark ? 'bg-zinc-900 border border-zinc-800 shadow-green-900/20' : 'bg-white border border-zinc-200 shadow-green-200/40'}`}>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto z-20">
          <div className={`inline-block mb-4 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${isDark ? 'bg-zinc-900 border-zinc-800 text-green-400' : 'bg-white border-zinc-200 text-green-600'}`}>
            100% Free & Built for Students
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Your personal AI mentor for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              cracking top placements
            </span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Stop paying for expensive career coaches. Build ATS-friendly resumes, identify your exact skill gaps, and practice with our AI interviewer—completely free.
          </p>

          <Link to="/register" className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2 w-fit mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] hover:-translate-y-1">
            Start Learning for Free <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* --- Floating Background Components --- */}
        {/* Outer divs handle the Parallax scroll translation. Inner divs handle the continuous CSS animation. */}

        {/* ATS Score Sticky Note */}
        <div 
          style={{ transform: `translateY(${scrollY * -0.25}px)` }} 
          className="hidden lg:flex absolute top-16 left-[10%] z-0 transition-transform duration-75 ease-out"
        >
          <div className="bg-yellow-400/90 text-yellow-950 p-5 rounded-md w-56 shadow-2xl backdrop-blur-sm anim-float-1">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
            <p className="font-writing text-sm leading-relaxed font-medium">
              "Your ATS score hit 90! Your resume is ready for the SDE intern role."
            </p>
          </div>
        </div>

        {/* Readiness Score */}
        <div 
          style={{ transform: `translateY(${scrollY * 0.12}px)` }} 
          className="hidden lg:flex absolute top-48 left-[18%] z-0 transition-transform duration-75 ease-out"
        >
          <div className={`p-4 rounded-2xl shadow-xl items-center gap-3 flex anim-float-2 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle2 className="text-green-500 w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Readiness Score</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>85/100</p>
            </div>
          </div>
        </div>

        {/* Up Next Card */}
        <div 
          style={{ transform: `translateY(${scrollY * -0.1}px)` }} 
          className="hidden lg:block absolute top-24 right-[12%] z-0 transition-transform duration-75 ease-out"
        >
          <div className={`backdrop-blur-md p-5 rounded-2xl w-64 shadow-2xl anim-float-3 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Up Next</span>
              <div className={`p-1.5 rounded-md ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <Clock className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>AI Mock Interview</p>
              <p className={`text-xs mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Topic: Data Structures</p>
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 w-fit px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" /> Practice Now
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }} 
          className="hidden lg:block absolute bottom-24 left-[12%] z-0 transition-transform duration-75 ease-out"
        >
          <div className={`backdrop-blur-md p-5 rounded-2xl w-72 shadow-2xl anim-float-4 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Skill Gap Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>System Design</span>
                  <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>40%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div className="h-full bg-red-500 w-[40%] transition-all duration-1000 ease-out"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>React / Next.js</span>
                  <span className="text-green-400 font-medium">92%</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div className="h-full bg-green-500 w-[92%] transition-all duration-1000 ease-out delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tailored Roles Icons */}
        <div 
          style={{ transform: `translateY(${scrollY * -0.2}px)` }} 
          className="hidden lg:block absolute bottom-32 right-[15%] z-0 transition-transform duration-75 ease-out"
        >
          <div className={`backdrop-blur-md p-6 rounded-2xl w-64 shadow-2xl anim-float-5 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
            <p className={`text-xs font-medium mb-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tailored for top roles</p>
            <div className="flex justify-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                <Code2 className="text-blue-400 w-6 h-6" />
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg relative -top-3 anim-float-icon ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                <Zap className="text-yellow-400 w-6 h-6" />
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                <LineChart className="text-green-400 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;