import { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, Target, Mic, Map, Briefcase, Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const features = [
  {
    title: 'Smart Resume Builder',
    description: 'Upload your PDF and let our AI parse, score, and rewrite your bullet points.',
    icon: <FileText className="w-5 h-5 text-green-500" />
  },
  {
    title: 'Skill Gap Detection',
    description: 'Compare your current profile against real job descriptions to see what you need.',
    icon: <Target className="w-5 h-5 text-green-500" />
  },
  {
    title: 'Live Mock Interviews',
    description: 'Chat or talk with our AI interviewer. Get instant feedback on your accuracy.',
    icon: <Mic className="w-5 h-5 text-green-500" />
  },
  {
    title: 'Personalized Roadmaps',
    description: 'Input your target role and get a week-by-week study plan generated instantly.',
    icon: <Map className="w-5 h-5 text-green-500" />
  },
  {
    title: 'AI Quizzes',
    description: 'Test your knowledge on specific topics. The AI adapts the difficulty dynamically.',
    icon: <Search className="w-5 h-5 text-green-500" />
  },
  {
    title: 'Internship Discovery',
    description: 'Aggregated listings of the latest internships matched to your readiness score.',
    icon: <Briefcase className="w-5 h-5 text-green-500" />
  }
];

const Features = () => {
  const { isDark } = useTheme();
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedPathRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // State
  const [pathData, setPathData] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 1. Calculate a Smooth, Wide S-Curve
  const calculatePath = useCallback(() => {
    if (!containerRef.current || dotsRef.current.length === 0) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const points: { x: number, y: number }[] = [];

    dotsRef.current.forEach((dot) => {
      if (dot) {
        const dotRect = dot.getBoundingClientRect();
        points.push({
          x: dotRect.left - containerRect.left + dotRect.width / 2,
          y: dotRect.top - containerRect.top + dotRect.height / 2,
        });
      }
    });

    if (points.length === 0) return;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }

    setPathData(d);

    setTimeout(() => {
      if (animatedPathRef.current) {
        const length = animatedPathRef.current.getTotalLength();
        animatedPathRef.current.style.strokeDasharray = `${length}`;
        window.dispatchEvent(new Event('scroll'));
      }
    }, 50);
  }, []);

  // Recalculate curve on mount and resize (with debounce for accurate layout reads)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      // Clear mobile-only popups when scaling up to desktop
      if (window.innerWidth >= 768) {
        setActiveIndex(null);
      }
      
      // Debounce the path calculation so the DOM has time to shift layouts first
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        calculatePath();
      }, 150); 
    };

    window.addEventListener('resize', handleResize);
    calculatePath(); // Initial calculation
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [calculatePath]);

  // 2. High-Performance Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !animatedPathRef.current) return;
      
      requestAnimationFrame(() => {
        const rect = containerRef.current!.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const scrollStart = windowHeight * 0.75; 
        const totalScrollable = rect.height - 50; 
        
        let progress = (scrollStart - rect.top) / totalScrollable;
        progress = Math.max(0, Math.min(1, progress));
        
        const pathLength = animatedPathRef.current!.getTotalLength();
        const offset = pathLength - (progress * pathLength);
        
        animatedPathRef.current!.style.strokeDashoffset = `${offset}`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathData]);

  // 3. Intersection Observer for Fade-ins
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.add(index);
              return next;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.feature-timeline-card');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="features" 
      className={`py-24 border-t font-sans overflow-visible transition-colors duration-300 ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200'}`}
      onClick={() => setActiveIndex(null)} // Clicking outside closes mobile popups
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className={`text-3xl md:text-5xl font-extrabold mb-6 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">get hired</span>
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Gandiva AI orchestrates multiple AI agents to provide a complete, end-to-end career prep experience.
          </p>
        </div>

        {/* Curved Timeline Container */}
        <div ref={containerRef} className="relative w-full py-10 overflow-visible">
          
          {/* Background SVG Canvas */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            <path 
              d={pathData} 
              stroke={isDark ? '#18181b' : '#f4f4f5'} 
              strokeWidth="20" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              ref={animatedPathRef}
              d={pathData} 
              stroke="#22c55e" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round"
              style={{
                filter: isDark ? 'drop-shadow(0 0 12px rgba(34,197,94,0.7))' : 'drop-shadow(0 0 8px rgba(34,197,94,0.5))',
                transition: 'none' 
              }}
            />
          </svg>

          {/* Timeline Nodes */}
          <div className="space-y-48 md:space-y-32 relative z-10 pb-24">
            {features.map((feature, index) => {
              const isLeft = index % 2 === 0;
              const isVisible = visibleItems.has(index);
              const isActive = activeIndex === index;

              return (
                <div 
                  key={index}
                  data-index={index}
                  className={`feature-timeline-card flex w-full h-12 md:h-auto items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`relative w-[85%] md:w-[35%] transition-all duration-700 ease-out 
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                  `}>
                    
                    <div 
                      ref={(el) => {dotsRef.current[index] = el}}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Only trigger popup state on mobile devices
                        if (window.innerWidth < 768) {
                          setActiveIndex(isActive ? null : index);
                        }
                      }}
                      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full border-[3px] z-20 transition-all duration-300
                        ${isVisible ? 'scale-100' : 'scale-0'}
                        ${isLeft ? '-right-7' : '-left-7'}
                        ${isDark ? 'bg-zinc-950' : 'bg-white shadow-md'}
                        ${
                          // Only apply the green active styles on mobile. On desktop, keep standard hover effects.
                          isActive 
                            ? 'scale-110 shadow-[0_0_20px_rgba(34,197,94,0.6)] border-green-500 cursor-pointer' 
                            : 'md:hover:scale-110 border-zinc-200 dark:border-zinc-800 md:cursor-default cursor-pointer'
                        }
                      `}
                    >
                      {feature.icon}

                      {/* --- MOBILE ONLY INLINE POPUP --- */}
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute bottom-[130%] w-64 p-5 rounded-2xl shadow-2xl md:hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                          ${isActive ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                          ${isLeft ? '-right-4 origin-bottom-right' : '-left-4 origin-bottom-left'}
                          ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-100'}
                        `}
                      >
                        <div className={`absolute -bottom-2 w-4 h-4 rotate-45 border-r border-b
                          ${isLeft ? 'right-9' : 'left-9'}
                          ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}
                        `} />
                        
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {feature.title}
                          </h3>
                          <button onClick={() => setActiveIndex(null)} className="p-1 -mr-2 -mt-1 opacity-50 hover:opacity-100">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* The Card (Always visible on Desktop, completely hidden on Mobile) */}
                    <div className={`hidden md:block p-8 rounded-2xl w-full relative z-10 transition-colors
                      ${isDark ? 'bg-zinc-900/80 border border-zinc-800 hover:border-green-500/30' : 'bg-white border border-zinc-200 hover:border-green-400/40 shadow-sm'}
                    `}>
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {feature.description}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;