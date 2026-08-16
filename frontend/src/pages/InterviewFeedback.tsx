import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, CheckCircle, XCircle, Loader2, Printer, 
  Sparkles, Brain, Compass, Lightbulb
} from 'lucide-react';
import { getInterviewDetails, type InterviewSessionData } from '../services/interview'; 

const InterviewFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const cardBg = isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await getInterviewDetails(id!);
        setSession(data);
      } catch (error) {
        console.error("Failed to load feedback", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
        <p className={`text-sm font-bold ${secondaryText}`}>Compiling Executive Evaluation Dossier...</p>
      </div>
    );
  }

  if (!session || !session.evaluation) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-6 text-center ${bgColor} ${textColor}`}>
        <p className="mb-4 font-bold text-xl">Evaluation not found or still processing.</p>
        <button 
          onClick={() => navigate('/interviews')} 
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Back to Interviews Hub
        </button>
      </div>
    );
  }

  const { overall_score, strengths, areas_of_improvement, detailed_feedback } = session.evaluation;

  // Extract meta-info if stored in first item
  let metaInfo: any = null;
  const questionsList: any[] = [];

  if (Array.isArray(detailed_feedback)) {
    detailed_feedback.forEach((item: any) => {
      if (item && item.is_meta) {
        metaInfo = item;
      } else {
        questionsList.push(item);
      }
    });
  }

  const technicalScore = metaInfo?.technical_score || Math.min(10, Math.max(1, overall_score + 1));
  const communicationScore = metaInfo?.communication_score || overall_score;
  const problemSolvingScore = metaInfo?.problem_solving_score || Math.min(10, Math.max(1, overall_score));
  
  const recommendation = metaInfo?.recommendation || (
    overall_score >= 8.5 ? 'Strong Hire' :
    overall_score >= 7.0 ? 'Hire' :
    overall_score >= 5.5 ? 'Leaning Hire' : 'Needs Practice'
  );

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Strong Hire (Top 10%)' };
      case 'Hire':
        return { bg: 'bg-green-500/10 text-green-400 border-green-500/30', label: 'Hire (Standard Cleared)' };
      case 'Leaning Hire':
        return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Leaning Hire (Minor Gaps)' };
      default:
        return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'Needs Remediation' };
    }
  };

  const badgeStyle = getRecommendationBadge(recommendation);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-5xl mx-auto font-sans ${bgColor} ${textColor}`}>
      
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button 
          onClick={() => navigate('/interviews')} 
          className={`flex items-center gap-2 text-xs font-bold ${secondaryText} hover:${textColor} transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Interviews
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <Printer className="w-3.5 h-3.5" /> Export Dossier (PDF)
          </button>

          <Link
            to="/roadmaps"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm shadow-green-600/20"
          >
            <Compass className="w-3.5 h-3.5" /> Remediation Roadmap
          </Link>
        </div>
      </div>

      {/* Hero Assessment Dossier Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-8 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badgeStyle.bg}`}>
                {badgeStyle.label}
              </span>
              <span className={`text-xs ${secondaryText}`}>
                {session.company || 'Enterprise Bar'} • {session.difficulty} Level
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{session.role} Performance Dossier</h1>
            <p className={`text-xs mt-1 ${secondaryText}`}>
              Completed on {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'Today'} • Verified by AI Hiring Committee
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Overall Rating</span>
              <div className="text-4xl font-black text-green-500">
                {overall_score}<span className="text-lg font-bold text-zinc-500">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multidimensional Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Technical Proficiency</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-blue-500">{technicalScore}/10</span>
              <span className="text-[11px] font-semibold text-zinc-400">Accuracy & Syntax</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${technicalScore * 10}%` }} />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Communication Clarity</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-purple-500">{communicationScore}/10</span>
              <span className="text-[11px] font-semibold text-zinc-400">Articulation & Pace</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${communicationScore * 10}%` }} />
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">Problem Solving & Architecture</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-emerald-500">{problemSolvingScore}/10</span>
              <span className="text-[11px] font-semibold text-zinc-400">Trade-offs & Edge cases</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${problemSolvingScore * 10}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className={`p-6 rounded-3xl border ${cardBg}`}>
          <h3 className="font-bold flex items-center gap-2 mb-4 text-base text-emerald-400">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Key Strengths Demonstrated
          </h3>
          <ul className="space-y-3">
            {strengths?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
                <span className="text-emerald-500 font-bold mt-0.5">•</span> 
                <span className={secondaryText}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`p-6 rounded-3xl border ${cardBg}`}>
          <h3 className="font-bold flex items-center gap-2 mb-4 text-base text-rose-400">
            <XCircle className="w-5 h-5 text-rose-500" /> Priority Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {areas_of_improvement?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed">
                <span className="text-rose-500 font-bold mt-0.5">•</span> 
                <span className={secondaryText}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Q&A Feedback */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" /> Question Breakdown & Model Solutions
          </h2>
          <span className="text-xs font-semibold text-zinc-500">
            {questionsList.length} Evaluated Responses
          </span>
        </div>

        {questionsList.map((item: any, i: number) => (
          <div key={i} className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                Question {i + 1}
              </span>
            </div>

            <h3 className="font-bold text-base sm:text-lg mb-4">
              {item.question}
            </h3>
            
            {/* Candidate Answer */}
            <div className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-black/60 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                Your Answer & Approach:
              </span>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.user_answer}</p>
            </div>

            {/* Model Ideal Benchmark if available */}
            {item.model_ideal_answer && (
              <div className={`p-4 rounded-2xl mb-4 border ${isDark ? 'bg-blue-500/5 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Benchmark Ideal Solution / Architectural Approach:
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.model_ideal_answer}</p>
              </div>
            )}

            {/* AI Committee Feedback */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-200' : 'bg-emerald-50/50 border-emerald-200 text-zinc-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Evaluator Assessment & Takeaways:
              </span>
              <p className="text-xs leading-relaxed">{item.feedback}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Next Actions CTA */}
      <div className={`mt-10 p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div>
          <h3 className="font-bold text-base">Ready for your next practice milestone?</h3>
          <p className={`text-xs mt-0.5 ${secondaryText}`}>
            Address identified weak areas in your career roadmap or test concepts in timed quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/quizzes"
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700'
            }`}
          >
            Take Skill Quiz
          </Link>
          <button
            onClick={() => navigate('/interviews')}
            className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-md shadow-green-600/20"
          >
            Start Another Session
          </button>
        </div>
      </div>

    </div>
  );
};

export default InterviewFeedback;