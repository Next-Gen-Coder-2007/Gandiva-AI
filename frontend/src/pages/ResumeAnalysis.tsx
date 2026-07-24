import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, Sparkles, Target, FileText, 
  CheckCircle2, XCircle, AlertTriangle, 
  TrendingUp, BarChart3, Briefcase, Lightbulb, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { analyzeResume, getResumeAnalysis } from '../services/resume';
import Modal from '../components/Modal';

// --- TYPES ---
export interface AnalyzeResumeRequest {
  target_job_title?: string;
  job_description?: string;
}

export interface SectionFeedback {
  section_name: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  missing_information: string[];
  suggestions: string[];
}

export interface PrioritizedSuggestion {
  priority: string;
  category: string;
  actionable_advice: string;
}

export interface ResumeAnalysisResponse {
  id: number;
  resume_id: number;
  target_job_title: string | null;
  job_description: string | null;
  overall_score: number | null;
  ats_score: number | null;
  keyword_score: number | null;
  skills_score: number | null;
  experience_score: number | null;
  projects_score: number | null;
  education_score: number | null;
  summary?: string;
  analysis_result: SectionFeedback[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  matching_skills: string[] | null;
  missing_skills: string[] | null;
  matching_keywords: string[] | null;
  missing_keywords: string[] | null;
  suggestions: PrioritizedSuggestion[] | null;
  created_at: string;
  updated_at: string | null;
}

// --- UTILS ---
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-rose-500';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
};

// --- SUB-COMPONENTS ---

const JobAnalysisForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnalyzeResumeRequest) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'general' | 'specific'>('general');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = () => {
    if (mode === 'general') {
      onSubmit({});
    } else {
      onSubmit({ target_job_title: jobTitle, job_description: jobDescription });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure AI Analysis">
      <div className={`flex gap-1 mb-6 p-1 rounded-xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
        <button
          onClick={() => setMode('general')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'general' ? 'bg-white dark:bg-zinc-800 shadow-sm text-purple-600 dark:text-purple-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
        >
          <FileText className="w-4 h-4" /> General Scan
        </button>
        <button
          onClick={() => setMode('specific')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${mode === 'specific' ? 'bg-white dark:bg-zinc-800 shadow-sm text-purple-600 dark:text-purple-400' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
        >
          <Target className="w-4 h-4" /> Job Specific
        </button>
      </div>

      {mode === 'specific' && (
        <div className="space-y-5 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Target Role / Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={`w-full p-3.5 rounded-xl border outline-none transition-all ${isDark ? 'bg-black border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20' : 'bg-white border-zinc-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Job Description</label>
            <textarea
              rows={6}
              placeholder="Paste the full job description here for deep matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`w-full p-3.5 rounded-xl border outline-none resize-none transition-all ${isDark ? 'bg-black border-zinc-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20' : 'bg-white border-zinc-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'}`}
            />
          </div>
        </div>
      )}

      {mode === 'general' && (
        <div className={`p-4 mb-6 rounded-xl text-sm border flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isDark ? 'bg-purple-900/10 border-purple-900/30 text-purple-200' : 'bg-purple-50 border-purple-100 text-purple-800'}`}>
          <Sparkles className="w-5 h-5 shrink-0 text-purple-500" />
          <p>A general scan evaluates your resume against modern industry standards, formatting best practices, and ATS parsability without targeting a specific role.</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || (mode === 'specific' && !jobDescription.trim())}
        className="w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 hover:shadow-md hover:shadow-purple-500/20 disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed"
      >
        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...</> : 'Generate Deep Analysis Report'}
      </button>
    </Modal>
  );
};

const AnalysisScoreCard: React.FC<{ score: number | null; title: string; subtitle: string; icon: React.ReactNode }> = ({ score, title, subtitle, icon }) => {
  const { isDark } = useTheme();
  const displayScore = score ?? 0;
  const colorClass = getScoreColor(displayScore);

  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 hover:shadow-md ${isDark ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-800/50 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
          {icon}
        </div>
        <div className={`text-4xl font-black tracking-tighter ${colorClass}`}>
          {displayScore}
        </div>
      </div>
      <div>
        <h3 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{title}</h3>
        <p className={`text-sm mt-1 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

const ScoreBreakdown: React.FC<{ scores: { label: string; value: number | null }[] }> = ({ scores }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
      <h3 className={`text-lg font-bold tracking-tight mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        <BarChart3 className="w-5 h-5 text-purple-500" /> Detailed Breakdown
      </h3>
      <div className="space-y-4">
        {scores.map((s, i) => {
          const val = s.value ?? 0;
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className={`font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{s.label}</span>
                <span className={`font-bold ${getScoreColor(val)}`}>{val}/100</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreBg(val)}`} 
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StrengthsWeaknesses: React.FC<{ strengths: string[] | null, weaknesses: string[] | null }> = ({ strengths, weaknesses }) => {
  const { isDark } = useTheme();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className={`p-6 md:p-8 rounded-3xl border ${isDark ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-emerald-50/50 border-emerald-100'}`}>
        <h3 className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-5 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5"/> Key Strengths
        </h3>
        <ul className="space-y-3.5">
          {strengths?.map((s, i) => (
            <li key={i} className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'} flex items-start gap-3`}>
              <span className="shrink-0 p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className={`p-6 md:p-8 rounded-3xl border ${isDark ? 'bg-rose-950/10 border-rose-900/30' : 'bg-rose-50/50 border-rose-100'}`}>
        <h3 className="text-lg font-bold tracking-tight text-rose-600 dark:text-rose-400 mb-5 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5"/> Areas for Improvement
        </h3>
        <ul className="space-y-3.5">
          {weaknesses?.map((w, i) => (
            <li key={i} className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'} flex items-start gap-3`}>
              <span className="shrink-0 p-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mt-0.5">
                <XCircle className="w-3.5 h-3.5" />
              </span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TagAnalysis: React.FC<{ title: string, matching: string[] | null, missing: string[] | null, icon: React.ReactNode }> = ({ title, matching, missing, icon }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 md:p-8 rounded-3xl border flex flex-col h-full ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
      <h3 className={`text-lg font-bold tracking-tight mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {icon} {title}
      </h3>
      <div className="mb-6">
        <p className={`text-xs uppercase font-extrabold tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Present in Resume</p>
        <div className="flex flex-wrap gap-2">
          {matching?.length ? matching.map((t, i) => (
            <span key={i} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{t}</span>
          )) : <span className="text-sm font-medium italic text-zinc-500">None detected</span>}
        </div>
      </div>
      <div className="mt-auto">
        <p className={`text-xs uppercase font-extrabold tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Missing Requirements</p>
        <div className="flex flex-wrap gap-2">
          {missing?.length ? missing.map((t, i) => (
            <span key={i} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{t}</span>
          )) : <span className="text-sm font-medium italic text-zinc-500">None missing</span>}
        </div>
      </div>
    </div>
  );
};

const SectionAnalysis: React.FC<{ sections: SectionFeedback[] | null }> = ({ sections }) => {
  const { isDark } = useTheme();
  if (!sections) return null;

  return (
    <div className="space-y-4">
      <h3 className={`text-xl font-bold tracking-tight mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Deep Dive by Section</h3>
      {sections.map((section, idx) => (
        <div key={idx} className={`p-6 rounded-2xl border transition-all hover:shadow-sm ${isDark ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
          <div className="flex items-center justify-between mb-5">
            <h4 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{section.section_name}</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(section.score)} ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              {section.score}/100
            </span>
          </div>
          <div className="space-y-3">
            {section.suggestions?.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${isDark ? 'bg-black/20 border-zinc-800/50 text-zinc-300' : 'bg-zinc-50/50 border-zinc-100 text-zinc-600'}`}>
                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                <p className="text-sm font-medium leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ImprovementSuggestions: React.FC<{ suggestions: PrioritizedSuggestion[] | null }> = ({ suggestions }) => {
  const { isDark } = useTheme();
  if (!suggestions) return null;

  const getPriorityStyles = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'medium': return 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default: return 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className={`p-6 md:p-8 rounded-3xl border h-full ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
      <h3 className={`text-lg font-bold tracking-tight mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        <TrendingUp className="w-5 h-5 text-purple-500" /> Actionable Roadmap
      </h3>
      <div className="space-y-4">
        {suggestions.map((s, i) => {
          const priorityStyles = getPriorityStyles(s.priority);
          return (
            <div key={i} className={`p-4 rounded-2xl border-l-4 flex flex-col sm:flex-row gap-4 transition-all hover:bg-black/5 dark:hover:bg-white/5 ${isDark ? 'border-zinc-800 bg-zinc-950/50' : 'border-y-zinc-100 border-r-zinc-100 bg-zinc-50'} ${priorityStyles.split(' ')[0]}`}>
              <div className="shrink-0">
                <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md ${priorityStyles}`}>
                  {s.priority} Priority
                </span>
              </div>
              <div>
                <h4 className={`text-sm font-bold mb-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{s.category}</h4>
                <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{s.actionable_advice}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function ResumeAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<ResumeAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data } = await getResumeAnalysis(parseInt(id));
        setAnalysis(data);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError("Failed to load past analysis. Please try generating a new one.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const handleStartAnalysis = async (requestData: AnalyzeResumeRequest) => {
    if (!id) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const { data } = await analyzeResume(parseInt(id), requestData);
      setAnalysis(data);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
        <div className="relative">
          <div className="absolute inset-0 blur-xl opacity-50 bg-purple-500 rounded-full animate-pulse"></div>
          <Loader2 className="relative w-12 h-12 text-purple-500 animate-spin mb-4 mx-auto" />
        </div>
        <p className="mt-4 font-bold text-lg tracking-tight">Fetching AI Insights...</p>
        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>This might take a few seconds</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 md:py-12 max-w-7xl mx-auto font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/resumes')} 
            className={`p-2.5 rounded-xl border transition-all hover:shadow-md ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-50'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Resume Analysis</h1>
            <div className={`mt-1.5 flex items-center gap-2 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {analysis?.target_job_title ? (
                <><Target className="w-4 h-4 text-purple-500" /> Targeted Match: <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{analysis.target_job_title}</span></>
              ) : (
                <><FileText className="w-4 h-4 text-emerald-500" /> General Profile Scan</>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold tracking-wide hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4" /> Run New Scan
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!analysis && !isLoading && !error ? (
        <div className={`text-center py-24 px-4 border-2 border-dashed rounded-3xl transition-colors ${isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 mb-6">
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">No Analysis Data Yet</h2>
          <p className={`mb-8 max-w-md mx-auto text-base ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Run an AI analysis to score your resume against modern industry standards, discover keyword gaps, and get a step-by-step action plan to land more interviews.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-8 py-3.5 rounded-xl bg-purple-600 text-white font-bold transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/20"
          >
            Start Analysis
          </button>
        </div>
      ) : analysis && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* TOP ROW: SCORES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnalysisScoreCard 
              score={analysis.overall_score} 
              title="Quality Score" 
              subtitle="Overall market competitiveness"
              icon={<TrendingUp className="w-6 h-6" />}
            />
            <AnalysisScoreCard 
              score={analysis.ats_score} 
              title="ATS Compatibility" 
              subtitle="Machine readability & format"
              icon={<ShieldCheck className="w-6 h-6" />}
            />
            <div className="md:col-span-2 lg:col-span-1">
              <ScoreBreakdown scores={[
                { label: 'Keywords Optimization', value: analysis.keyword_score },
                { label: 'Skills Alignment', value: analysis.skills_score },
                { label: 'Experience Impact', value: analysis.experience_score },
                { label: 'Education Details', value: analysis.education_score },
                { label: 'Projects Quality', value: analysis.projects_score }
              ]} />
            </div>
          </div>

          {/* SUMMARY */}
          <div className={`relative overflow-hidden p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-3 flex items-center gap-2">
               Executive Summary
            </h3>
            <p className={`text-base font-medium leading-relaxed max-w-4xl relative z-10 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {analysis.summary || 'Analysis complete. Review the detailed sections below for granular feedback and actionable improvements.'}
            </p>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <StrengthsWeaknesses strengths={analysis.strengths} weaknesses={analysis.weaknesses} />

          {/* TAGS (Skills & Keywords) */}
          <div className="grid lg:grid-cols-2 gap-6">
            <TagAnalysis 
              title="Skills Gap Analysis" 
              icon={<Briefcase className="w-5 h-5 text-purple-500" />}
              matching={analysis.matching_skills} 
              missing={analysis.missing_skills} 
            />
            <TagAnalysis 
              title="Keyword Optimization" 
              icon={<Target className="w-5 h-5 text-purple-500" />}
              matching={analysis.matching_keywords} 
              missing={analysis.missing_keywords} 
            />
          </div>

          {/* BOTTOM ROW: SUGGESTIONS & SECTION DIVE */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 sticky top-8">
              <ImprovementSuggestions suggestions={analysis.suggestions} />
            </div>
            <div className="lg:col-span-7">
              <SectionAnalysis sections={analysis.analysis_result} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      <JobAnalysisForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleStartAnalysis} 
        isLoading={isAnalyzing} 
      />
    </div>
  );
}