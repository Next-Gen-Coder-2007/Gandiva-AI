import { FileText, Target, Mic, Map, Briefcase, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const features = [
  {
    title: 'Smart Resume Builder',
    description: 'Upload your PDF and let our AI parse, score, and rewrite your bullet points to beat the ATS.',
    icon: <FileText className="w-6 h-6 text-green-400" />
  },
  {
    title: 'Skill Gap Detection',
    description: 'Compare your current profile against real job descriptions to see exactly what you need to learn.',
    icon: <Target className="w-6 h-6 text-green-400" />
  },
  {
    title: 'Live Mock Interviews',
    description: 'Chat or talk with our AI interviewer. Get instant feedback on your technical accuracy and confidence.',
    icon: <Mic className="w-6 h-6 text-green-400" />
  },
  {
    title: 'Personalized Roadmaps',
    description: 'Input your target role and available hours, and get a week-by-week study plan generated instantly.',
    icon: <Map className="w-6 h-6 text-green-400" />
  },
  {
    title: 'AI Quizzes',
    description: 'Test your knowledge on specific topics. The AI detects your weak points and adapts the difficulty.',
    icon: <Search className="w-6 h-6 text-green-400" />
  },
  {
    title: 'Internship Discovery',
    description: 'Aggregated listings of the latest internships matched perfectly to your placement readiness score.',
    icon: <Briefcase className="w-6 h-6 text-green-400" />
  }
];

const Features = () => {
  const { isDark } = useTheme();

  return (
    <section id="features" className={`py-24 border-t font-sans transition-colors duration-300 ${isDark ? 'bg-black border-zinc-900' : 'bg-white border-zinc-200'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Everything you need to get hired</h2>
          <p className={`max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Gandiva AI orchestrates multiple AI agents to provide a complete, end-to-end career prep experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl transition-all group ${isDark ? 'bg-zinc-900/50 border border-zinc-800 hover:border-green-500/30 hover:bg-zinc-900' : 'bg-white border border-zinc-200 hover:border-green-400/40 hover:bg-zinc-50'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${isDark ? 'bg-black border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{feature.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;