import { CheckCircle2, Clock, ChevronRight, Zap, Code2, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Hero = () => {
  const { isDark } = useTheme();

  return (
    <div className={`relative overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-black text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e15_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative z-10 flex flex-col items-center justify-center py-24 px-4 min-h-[calc(100vh-80px)]">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl ${isDark ? 'bg-zinc-900 border border-zinc-800 shadow-green-900/20' : 'bg-white border border-zinc-200 shadow-green-200/40'}`}>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-300'}`}></div>
          </div>
        </div>

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

        <div className="hidden lg:flex absolute top-16 left-[10%] rotate-[-6deg] bg-yellow-400/90 text-yellow-950 p-5 rounded-md w-56 shadow-2xl backdrop-blur-sm z-0">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
          <p className="font-writing text-sm leading-relaxed font-medium">
            "Your ATS score hit 90! Your resume is ready for the SDE intern role."
          </p>
        </div>

        <div className={`hidden lg:flex absolute top-48 left-[18%] rotate-[4deg] p-4 rounded-2xl shadow-xl items-center gap-3 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
          <div className="bg-green-500/20 p-2 rounded-lg">
            <CheckCircle2 className="text-green-500 w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Readiness Score</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>85/100</p>
          </div>
        </div>

        <div className={`hidden lg:block absolute top-24 right-[12%] rotate-[3deg] backdrop-blur-md p-5 rounded-2xl w-64 shadow-2xl z-0 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
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

        <div className={`hidden lg:block absolute bottom-24 left-[12%] rotate-[2deg] backdrop-blur-md p-5 rounded-2xl w-72 shadow-2xl z-0 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Skill Gap Analysis</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>System Design</span>
                <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>40%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <div className="h-full bg-red-500 w-[40%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>React / Next.js</span>
                <span className="text-green-400 font-medium">92%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                <div className="h-full bg-green-500 w-[92%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`hidden lg:block absolute bottom-32 right-[15%] rotate-[-4deg] backdrop-blur-md p-6 rounded-2xl w-64 shadow-2xl z-0 ${isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white/80 border border-zinc-200'}`}>
          <p className={`text-xs font-medium mb-4 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Tailored for top roles</p>
          <div className="flex justify-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <Code2 className="text-blue-400 w-6 h-6" />
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg relative -top-3 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <Zap className="text-yellow-400 w-6 h-6" />
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <LineChart className="text-green-400 w-6 h-6" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;