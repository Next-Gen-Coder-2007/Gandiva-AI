import React, { useState, useEffect } from 'react';
import { 
  Trophy, FileCheck, Brain, Target, AlertCircle, ArrowRight, 
  Briefcase, Sparkles, RefreshCw, Loader2, CheckCircle2, 
  MapPin, ExternalLink, Activity, Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardAnalytics, type DashboardData } from '../services/analytics';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const fetchAnalytics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const analyticsData = await getDashboardAnalytics();
      setData(analyticsData);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError("Unable to load latest analytics. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'trophy': return Trophy;
      case 'file_check': return FileCheck;
      case 'brain': return Brain;
      case 'target': return Target;
      default: return Activity;
    }
  };

  const getMetricColors = (idx: number) => {
    switch (idx) {
      case 0: return { color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200' };
      case 1: return { color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200' };
      case 2: return { color: 'text-blue-500', bg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200' };
      case 3: return { color: 'text-purple-500', bg: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200' };
      default: return { color: 'text-green-500', bg: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200' };
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 85) return { grade: 'Ready for Top Tech Tier 1', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (score >= 70) return { grade: 'Placement Ready', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (score >= 50) return { grade: 'Intermediate Progress', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { grade: 'Foundation Phase', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  if (loading) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="relative w-10 h-10 text-green-500 animate-spin" />
        </div>
        <p className="font-semibold text-lg animate-pulse">Calculating Placement Intelligence...</p>
        <p className="text-xs text-zinc-500 mt-1">Aggregating resumes, quizzes, interviews, and market gaps</p>
      </div>
    );
  }

  const scoreInfo = getScoreGrade(data?.placement_readiness_score || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'Candidate'}!
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
              <Sparkles className="w-3.5 h-3.5" /> AI Engine Active
            </span>
          </div>
          <p className={`mt-1.5 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {user?.target_role ? `Targeting: ${user.target_role}` : 'Your unified career readiness and intelligence cockpit.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isDark ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-green-500' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh Metrics'}
          </button>
          
          <Link
            to="/settings"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20"
          >
            Profile Goals
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
          <span>{error}</span>
          <button onClick={() => fetchAnalytics(true)} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* HERO PLACEMENT READINESS SCORE BANNER */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-zinc-950 border-zinc-800/80 shadow-2xl' : 'bg-gradient-to-br from-white via-zinc-50 to-emerald-50/30 border-zinc-200 shadow-sm'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Trophy className="w-64 h-64" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-4 flex items-center gap-6">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className={`${isDark ? 'text-zinc-800' : 'text-zinc-200'}`}
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-green-500 transition-all duration-1000 ease-out"
                  strokeWidth="10"
                  strokeDasharray={314.159}
                  strokeDashoffset={314.159 - (314.159 * (data?.placement_readiness_score || 0)) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black tracking-tighter">
                  {data?.placement_readiness_score || 0}
                  <span className="text-sm font-bold text-green-500">%</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Readiness</span>
              </div>
            </div>

            <div>
              <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-1.5 ${scoreInfo.bg} ${scoreInfo.color}`}>
                {scoreInfo.grade}
              </span>
              <h2 className="text-xl font-bold tracking-tight">Placement Score</h2>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Weighted readiness metric across resume, coding tests, mock interviews, and projects.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                Formula Breakdown <Info className="w-3.5 h-3.5 cursor-pointer text-zinc-400 hover:text-zinc-200" onClick={() => setShowFormula(!showFormula)} />
              </span>
              <span className="text-xs font-semibold text-green-500">
                {data?.summary.completed_interviews || 0} Interviews • {data?.summary.total_quiz_attempts || 0} Quizzes • {data?.summary.completed_roadmap_tasks || 0} Tasks Done
              </span>
            </div>

            {/* Micro Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Resume (30%)</span>
                <span className="text-sm font-extrabold text-emerald-500">{data?.score_breakdown.resume_ats || 0}/100</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Quiz (25%)</span>
                <span className="text-sm font-extrabold text-blue-500">{data?.score_breakdown.quiz_score || 0}/100</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Interview (20%)</span>
                <span className="text-sm font-extrabold text-purple-500">{data?.score_breakdown.interview_score || 0}/100</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Projects (15%)</span>
                <span className="text-sm font-extrabold text-amber-500">{data?.score_breakdown.project_score || 0}/100</span>
              </div>
              <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${isDark ? 'bg-black/40 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">Skills (10%)</span>
                <span className="text-sm font-extrabold text-teal-500">{data?.score_breakdown.skill_score || 0}/100</span>
              </div>
            </div>

            {showFormula && (
              <p className={`mt-3 text-xs leading-relaxed p-3 rounded-xl border animate-in fade-in duration-200 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'}`}>
                <strong>Weighted Formula:</strong> 30% Resume ATS Score + 25% Quiz Score + 20% Mock Interview Evaluation + 15% Projects Quality + 10% Skill Match Index.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CORE 4 METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.metrics.map((m, i) => {
          const Icon = getMetricIcon(m.icon_type);
          const style = getMetricColors(i);
          return (
            <div key={i} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl border ${style.bg} ${style.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className={`text-xs uppercase font-extrabold tracking-wider mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{m.label}</h3>
              <p className="text-2xl font-black tracking-tight">{m.value}</p>
              {m.detail && (
                <p className={`text-xs mt-2 truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {m.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 2-COLUMN MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: RECOMMENDED AI ACTIONS & WEAK SKILLS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Action Recommendations */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" /> Recommended AI Next Steps
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Prioritized actions by your career mentor to maximize placement readiness.
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {data?.recommended_actions.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => navigate(act.link)}
                  className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md ${
                    isDark 
                      ? 'bg-zinc-900/40 border-zinc-800 hover:border-green-500/40 hover:bg-zinc-900/80' 
                      : 'bg-zinc-50 border-zinc-200 hover:border-green-500/40 hover:bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        act.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {act.category}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base group-hover:text-green-500 transition-colors">
                        {act.title}
                      </h4>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {act.description}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-green-500 group-hover:translate-x-1 transition-transform">
                    <span>{act.button_text}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/resumes" className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-emerald-500/40' : 'bg-white border-zinc-200 hover:border-emerald-500/40 shadow-sm'}`}>
              <FileCheck className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
              <span className="text-xs font-bold block">Resumes</span>
              <span className="text-[10px] text-zinc-500">{data?.summary.total_resumes || 0} active</span>
            </Link>
            <Link to="/quizzes" className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-blue-500/40' : 'bg-white border-zinc-200 hover:border-blue-500/40 shadow-sm'}`}>
              <Brain className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <span className="text-xs font-bold block">Quizzes</span>
              <span className="text-[10px] text-zinc-500">{data?.summary.total_quizzes || 0} generated</span>
            </Link>
            <Link to="/interviews" className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-purple-500/40' : 'bg-white border-zinc-200 hover:border-purple-500/40 shadow-sm'}`}>
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <span className="text-xs font-bold block">Mock Sessions</span>
              <span className="text-[10px] text-zinc-500">{data?.summary.completed_interviews || 0} evaluated</span>
            </Link>
            <Link to="/roadmaps" className={`p-4 rounded-2xl border text-center transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950/60 border-zinc-800 hover:border-teal-500/40' : 'bg-white border-zinc-200 hover:border-teal-500/40 shadow-sm'}`}>
              <Activity className="w-6 h-6 mx-auto mb-2 text-teal-500" />
              <span className="text-xs font-bold block">Roadmaps</span>
              <span className="text-[10px] text-zinc-500">{data?.summary.total_roadmaps || 0} tracks</span>
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN: DETECTED SKILL GAPS & MATCHED INTERNSHIPS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Skill Gaps Card */}
          <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" /> Identified Skill Gaps
              </h2>
              <Link to="/roadmaps" className="text-xs font-bold text-green-500 hover:underline">
                Generate Plan →
              </Link>
            </div>
            
            <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Skills missing in your resume or requiring more assessment practice:
            </p>

            <div className="flex flex-wrap gap-2">
              {data?.weak_skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    isDark 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>

            {data?.matched_skills && data.matched_skills.length > 0 && (
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified Core Strengths
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.matched_skills.slice(0, 5).map((s, idx) => (
                    <span key={idx} className={`px-2.5 py-1 text-[11px] font-medium rounded-md border ${
                      isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Matched Internships */}
          <div className={`p-6 sm:p-7 rounded-3xl border shadow-sm ${isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" /> Matched Internships
              </h2>
              <Link to="/internships" className="text-xs font-bold text-green-500 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3.5">
              {data?.recommended_internships.slice(0, 3).map((job) => (
                <div 
                  key={job.id} 
                  className={`p-4 rounded-2xl border transition-all hover:shadow-sm ${
                    isDark ? 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700' : 'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{job.title}</h4>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {job.company} • {job.salary}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-black rounded-md bg-green-500/10 text-green-500 border border-green-500/20">
                      {job.match_percentage}% Match
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className={`flex items-center gap-1 text-[11px] truncate max-w-[180px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <MapPin className="w-3 h-3 text-zinc-400" /> {job.location}
                    </span>
                    <a 
                      href={job.redirect_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold text-green-500 hover:underline"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;