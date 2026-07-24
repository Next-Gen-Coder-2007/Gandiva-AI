import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Award, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getInterviewDetails } from '../services/interview'; 

const InterviewFeedback: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const cardBg = isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
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
      <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    );
  }

  if (!session || !session.evaluation) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${bgColor} ${textColor}`}>
        <p className="mb-4 font-bold text-xl">Evaluation not found or still processing.</p>
        <button onClick={() => navigate('/interviews')} className="px-6 py-2 bg-green-600 text-white rounded-xl">Back to Dashboard</button>
      </div>
    );
  }

  const { overall_score, strengths, areas_of_improvement, detailed_feedback } = session.evaluation;

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-5xl mx-auto font-sans ${bgColor} ${textColor}`}>
      <button onClick={() => navigate('/interviews')} className={`mb-6 flex items-center gap-2 text-sm font-medium ${secondaryText} hover:${textColor} transition-colors`}>
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">{session.role} Interview Report</h1>
        <p className={`mt-1 ${secondaryText}`}>Completed on {new Date(session.completed_at).toLocaleDateString()}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        {/* Score Card */}
        <div className={`flex-shrink-0 p-8 rounded-3xl border flex flex-col items-center justify-center text-center ${cardBg} md:w-72`}>
          <Award className={`w-12 h-12 mb-4 ${overall_score >= 7 ? 'text-green-500' : 'text-amber-500'}`} />
          <h2 className="text-5xl font-extrabold mb-2">{overall_score}<span className={`text-2xl ${secondaryText}`}>/10</span></h2>
          <p className={`text-sm font-bold uppercase tracking-wider ${secondaryText}`}>Overall Score</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-6 rounded-3xl border ${cardBg}`}>
            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><CheckCircle className="w-5 h-5 text-green-500" /> Strengths</h3>
            <ul className="space-y-3">
              {strengths?.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-green-500 mt-0.5">•</span> 
                  <span className={`leading-relaxed ${secondaryText}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`p-6 rounded-3xl border ${cardBg}`}>
            <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><XCircle className="w-5 h-5 text-red-500" /> Areas to Improve</h3>
            <ul className="space-y-3">
              {areas_of_improvement?.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-red-500 mt-0.5">•</span> 
                  <span className={`leading-relaxed ${secondaryText}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Q&A Feedback */}
      <h3 className="text-2xl font-bold mb-6">Question Breakdown</h3>
      <div className="space-y-6">
        {detailed_feedback?.map((item: any, i: number) => (
          <div key={i} className={`p-6 sm:p-8 rounded-3xl border ${cardBg}`}>
            <div className="mb-6">
              <span className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Question {i + 1}</span>
              <p className="font-medium text-lg mt-2">{item.question}</p>
            </div>
            
            <div className={`p-5 rounded-2xl mb-6 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Your Answer</span>
              <p className="text-sm mt-2 whitespace-pre-wrap">{item.user_answer}</p>
            </div>
            
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider text-green-500`}>AI Feedback</span>
              <p className={`text-sm mt-2 leading-relaxed ${secondaryText}`}>{item.feedback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewFeedback;