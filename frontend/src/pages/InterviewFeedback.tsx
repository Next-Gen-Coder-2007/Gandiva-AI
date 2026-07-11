import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowLeft, Award, Target, TrendingUp, AlertTriangle, 
  BookOpen, Map, Zap, CheckCircle2 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getInterview } from '../services/interview';

const InterviewFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? 'bg-black' : 'bg-zinc-50';
  const cardBg = isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await getInterview(Number(id));
        if (data.status !== 'completed' || !data.evaluation) {
          navigate(`/interviews/session/${id}`);
        } else {
          setSession(data);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
        navigate('/interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id, navigate]);

  if (loading || !session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  const { evaluation } = session;
  const { feedback } = evaluation;

  const ScoreCard = ({ title, score, icon: Icon }: { title: string, score: number, icon: any }) => (
    <div className={`p-4 rounded-2xl border flex items-center justify-between ${cardBg}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <Icon className="w-5 h-5 text-green-500" />
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <span className="text-xl font-bold">{score}/10</span>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans ${bgColor} ${textColor}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/interviews')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Evaluation Report</h1>
            <p className={`mt-1 ${secondaryText}`}>
              {session.role} at {session.company || 'Tech Company'} • {session.difficulty}
            </p>
          </div>
        </div>

        {/* Top Section: Overall Score & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-8 rounded-3xl border flex flex-col items-center justify-center text-center ${cardBg} md:col-span-1`}>
            <div className="relative mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" className={`${isDark ? 'text-zinc-800' : 'text-zinc-200'}`} strokeWidth="12" fill="none" stroke="currentColor" />
                <circle cx="64" cy="64" r="56" className="text-green-500" strokeWidth="12" fill="none" stroke="currentColor" strokeDasharray={`${(evaluation.overall_score / 10) * 351} 351`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold">{evaluation.overall_score}</span>
                <span className={`text-xs uppercase tracking-wider font-bold ${secondaryText}`}>Out of 10</span>
              </div>
            </div>
            <h3 className="font-bold text-lg">Overall Performance</h3>
          </div>

          <div className={`p-8 rounded-3xl border ${cardBg} md:col-span-2 flex flex-col justify-center`}>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-500" /> Detailed Explanation
            </h3>
            <p className={`leading-relaxed ${secondaryText}`}>
              {evaluation.detailed_explanation}
            </p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div>
          <h3 className="font-bold text-lg mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ScoreCard title="Communication" score={evaluation.communication_score} icon={Target} />
            <ScoreCard title="Technical Depth" score={evaluation.technical_score} icon={Zap} />
            <ScoreCard title="Problem Solving" score={evaluation.problem_solving_score} icon={TrendingUp} />
            <ScoreCard title="Confidence" score={evaluation.confidence_score} icon={Award} />
            <ScoreCard title="Accuracy" score={evaluation.accuracy_score} icon={CheckCircle2} />
            <ScoreCard title="Completeness" score={evaluation.completeness_score} icon={CheckCircle2} />
          </div>
        </div>

        {/* Feedback Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strengths */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-500">
              <TrendingUp className="w-5 h-5" /> Key Strengths
            </h3>
            <ul className="space-y-3">
              {feedback?.strengths?.map((item: string, i: number) => (
                <li key={i} className={`flex items-start gap-3 ${secondaryText}`}>
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" /> Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {feedback?.weaknesses?.map((item: string, i: number) => (
                <li key={i} className={`flex items-start gap-3 ${secondaryText}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Advice & Roadmap */}
        <div className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
          <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
            <Map className="w-6 h-6 text-green-500" /> Recommended Roadmap
          </h3>
          
          <div className="space-y-8">
            <p className={`text-sm leading-relaxed ${secondaryText}`}>
              {feedback?.recommended_roadmap}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Actionable Steps</h4>
                <ul className="space-y-2">
                  {feedback?.improvement_suggestions?.map((item: string, i: number) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${secondaryText}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Learning Resources</h4>
                <ul className="space-y-2">
                  {feedback?.learning_resources?.map((item: string, i: number) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${secondaryText}`}>
                      <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewFeedback;