import { Layout, Server, Database, Sparkles } from 'lucide-react';
import { 
  SiReact, 
  SiTypescript, 
  SiTailwindcss, 
  SiPython, 
  SiFastapi,
  SiSqlite,
  SiOpenai,
} from 'react-icons/si';
import { TbBrandFramerMotion } from 'react-icons/tb';
import { useTheme } from '../../context/ThemeContext';

const TechStack = () => {
  const { isDark } = useTheme();

  const stackCategories = [
    {
      id: "frontend",
      title: "Front End",
      headerIcon: <Layout strokeWidth={1.5} className="w-7 h-7" />,
      items: [
        { name: "React", icon: <SiReact className="text-[#61DAFB] w-9 h-9" /> },
        { name: "TypeScript", icon: <SiTypescript className="text-[#3178C6] w-9 h-9" /> },
        { name: "Tailwind", icon: <SiTailwindcss className="text-[#38B2AC] w-9 h-9" /> },
        { name: "Lenis", icon: <TbBrandFramerMotion className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'} w-9 h-9 transition-colors duration-300`} /> },
      ]
    },
    {
      id: "backend",
      title: "Back End",
      headerIcon: <Server strokeWidth={1.5} className="w-7 h-7" />,
      items: [
        { name: "FastAPI", icon: <SiFastapi className="text-[#009688] w-9 h-9" /> },
        { name: "Python", icon: <SiPython className="text-[#FFD43B] w-9 h-9" /> },
        { name: "LangChain", icon: <span className="text-[2.25rem] leading-none drop-shadow-md inline-block">🦜</span> },
        { name: "LangGraph", icon: <span className="text-[2.25rem] leading-none drop-shadow-md inline-block">🕸️</span> },
      ]
    },
    {
      id: "database",
      title: "Database",
      headerIcon: <Database strokeWidth={1.5} className="w-7 h-7" />,
      items: [
        { name: "SQLite", icon: <SiSqlite className="text-[#4AA8D8] w-9 h-9" /> },
        { name: "ChromaDB", icon: <Database className="text-[#FF4F4F] w-9 h-9" /> },
      ]
    },
    {
      id: "ai",
      title: "AI & Engine",
      headerIcon: <Sparkles strokeWidth={1.5} className="w-7 h-7" />,
      items: [
        { name: "OpenAI", icon: <SiOpenai className="text-[#10A37F] w-9 h-9" /> },
        { name: "Groq", icon: <span className="font-black italic text-[#F55036] text-xl flex items-center h-9 tracking-tighter">Groq</span> },
      ]
    }
  ];

  return (
    <section className={`relative pb-20 font-sans overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black text-zinc-100 selection:bg-green-500/30 selection:text-green-200' : 'bg-white text-zinc-900 selection:bg-green-500/20 selection:text-green-900'}`}>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none z-0">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] transition-opacity duration-500 ${isDark ? 'bg-green-500/5 opacity-100' : 'bg-green-500/10 opacity-70'}`} />
        
        <div className={`absolute inset-0 bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transition-colors duration-500 ${
          isDark 
            ? 'bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]'
        }`} />
      </div>

      <style>{`
        @keyframes reveal-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-reveal {
          opacity: 0;
          animation: reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        <header className="text-center mb-24 anim-reveal">
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Gandiva</span> Stack
          </h2>
          <p className={`text-lg max-w-2xl mx-auto font-medium transition-colors duration-300 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            A high-performance, AI-native infrastructure built to process, analyze, and accelerate career trajectories.
          </p>
        </header>

        {/* 4-Column Grid mapping to the reference image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stackCategories.map((category, index) => (
            <div 
              key={category.id} 
              className="anim-reveal flex flex-col items-center group cursor-default"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              
              {/* Top Icon Box */}
              <div className={`relative w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 transition-all duration-500 group-hover:-translate-y-1 z-10 ${
                isDark 
                  ? 'bg-[#0a0a0a] border-zinc-800 text-green-400 group-hover:border-green-500 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                  : 'bg-white border-zinc-200 text-green-600 group-hover:border-green-400 shadow-sm group-hover:shadow-[0_10px_30px_rgba(34,197,94,0.15)]'
              }`}>
                <div className="absolute inset-0 bg-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {category.headerIcon}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-8 tracking-wide transition-colors duration-300 ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
                {category.title}
              </h3>

              {/* The Bordered Container for Logos */}
              <div className={`w-full relative flex-grow p-8 rounded-3xl border transition-all duration-500 overflow-hidden ${
                isDark 
                  ? 'bg-[#050505] border-zinc-800/80 group-hover:border-green-500/40' 
                  : 'bg-white border-zinc-200 shadow-sm group-hover:border-green-400/60 group-hover:shadow-md'
              }`}>
                
                {/* Subtle Inner green glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Grid for Tech Logos */}
                <div className="relative grid grid-cols-2 gap-y-10 gap-x-4 place-items-center h-full content-start pt-2 z-10">
                  {category.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex flex-col items-center text-center group/item"
                    >
                      {/* Logo Wrapper */}
                      <div className="mb-4 h-12 flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-1 drop-shadow-sm">
                        {item.icon}
                      </div>
                      {/* Text */}
                      <span className={`text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${
                        isDark 
                          ? 'text-zinc-500 group-hover/item:text-zinc-200' 
                          : 'text-zinc-400 group-hover/item:text-zinc-800'
                      }`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TechStack;