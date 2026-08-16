import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Loader2, MessageSquare, Target, Activity, Trash2, 
  ArrowRight, Briefcase, ChevronRight, Sparkles, Building2,
  Code2, Cpu, Users, Search, Play, ShieldCheck, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal'; 
import { getInterviews, deleteInterview, createInterview } from '../services/interview';

interface TrackPreset {
  id: string;
  name: string;
  company: string;
  role: string;
  type: string;
  difficulty: string;
  experience: string;
  skills: string;
  icon: any;
  color: string;
  badge: string;
}

const PRESET_TRACKS: TrackPreset[] = [
  {
    id: 'google-sde',
    name: 'Google SDE Track',
    company: 'Google',
    role: 'Software Development Engineer',
    type: 'Technical',
    difficulty: 'Hard',
    experience: '1-3 Years',
    skills: 'Data Structures, Algorithms, Graph Traversal, Dynamic Programming, Time Complexity',
    icon: Code2,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    badge: 'FAANG / Tier 1'
  },
  {
    id: 'amazon-star',
    name: 'Amazon Bar Raiser (STAR)',
    company: 'Amazon',
    role: 'SDE II / Technical Lead',
    type: 'Behavioral',
    difficulty: 'Hard',
    experience: '3-5 Years',
    skills: 'Customer Obsession, Ownership, Deliver Results, Conflict Resolution, STAR Method',
    icon: Users,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    badge: 'Leadership'
  },
  {
    id: 'meta-system-design',
    name: 'Meta Distributed Systems',
    company: 'Meta',
    role: 'Systems & Infrastructure Engineer',
    type: 'System Design',
    difficulty: 'Hard',
    experience: '3-5 Years',
    skills: 'Distributed Caching, Load Balancing, Database Sharding, Event Driven Architecture, CAP Theorem',
    icon: Cpu,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    badge: 'Architecture'
  },
  {
    id: 'frontend-architect',
    name: 'Senior Frontend Specialist',
    company: 'Stripe',
    role: 'Senior Frontend Engineer',
    type: 'Technical',
    difficulty: 'Medium',
    experience: '3-5 Years',
    skills: 'React 19, TypeScript, State Architecture, Web Vitals Performance, Accessibility',
    icon: Sparkles,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    badge: 'Modern Web'
  }
];

const Interviews: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    role: '',
    experience: 'Fresher',
    difficulty: 'Medium',
    interview_type: 'Technical',
    num_questions: 5,
    company: '',
    skills: ''
  });

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const cardBg = isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-zinc-200';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-800 focus:border-green-500 text-zinc-100' : 'bg-zinc-50 border-zinc-200 focus:border-green-500 text-zinc-900';
  const textColor = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const secondaryText = isDark ? 'text-zinc-400' : 'text-zinc-600';

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await getInterviews();
      const responseData = response.data || response; 

      if (Array.isArray(responseData)) {
        setInterviews(responseData);
      } else if (responseData && Array.isArray(responseData.results)) {
        setInterviews(responseData.results);
      } else {
        setInterviews([]); 
      }
    } catch (err) {
      console.error("Failed to fetch interviews", err);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;
    try {
      await deleteInterview(id);
      fetchInterviews();
    } catch (err) {
      console.error("Failed to delete interview");
    }
  };

  const calculateAverageScore = () => {
    const safeInterviews = Array.isArray(interviews) ? interviews : [];
    const completed = safeInterviews.filter(i => i.status === 'completed' && i.evaluation);
    
    if (completed.length === 0) return '0.0';
    
    const total = completed.reduce((acc, curr) => acc + (curr.evaluation.overall_score || 0), 0);
    return (total / completed.length).toFixed(1);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPreset = (preset: TrackPreset) => {
    setFormData({
      role: preset.role,
      experience: preset.experience,
      difficulty: preset.difficulty,
      interview_type: preset.type,
      num_questions: 5,
      company: preset.company,
      skills: preset.skills
    });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.role.trim()) {
      setError("Target Role is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createInterview(formData);
      setIsModalOpen(false);
      const resData = (response as any).data || response;
      const newId = resData.id; 
      navigate(`/interviews/session/${newId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create interview session. Please try again.");
      setIsSubmitting(false);
    }
  };

  const safeInterviewsList = Array.isArray(interviews) ? interviews : [];
  const completedCount = safeInterviewsList.filter(i => i.status === 'completed').length;

  const filteredInterviews = safeInterviewsList.filter(session => {
    const matchesSearch = 
      session.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.company && session.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'All' || session.interview_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-7xl mx-auto font-sans ${bgColor} ${textColor}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">Enterprise Mock Interview Suite</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-green-500/10 text-green-500 border border-green-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> AI Proctored
            </span>
          </div>
          <p className={`mt-2 text-sm leading-relaxed ${secondaryText}`}>
            Simulate authentic Tier-1 tech interviews with real-time video preview, speech recognition, code scratchpad, and comprehensive hiring committee rubric evaluation.
          </p>
        </div>

        <button 
          onClick={() => {
            setFormData({
              role: '',
              experience: 'Fresher',
              difficulty: 'Medium',
              interview_type: 'Technical',
              num_questions: 5,
              company: '',
              skills: ''
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-md shadow-green-600/20 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" /> Custom Interview
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Total Sessions</p>
              <h3 className="text-2xl font-black">{safeInterviewsList.length}</h3>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Completed & Evaluated</p>
              <h3 className="text-2xl font-black">{completedCount}</h3>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Average Rating</p>
              <h3 className="text-2xl font-black">{calculateAverageScore()} <span className="text-sm font-normal text-zinc-500">/ 10</span></h3>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED COMPANY & ROLE TRACKS */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-500" /> Curated Enterprise Tracks
            </h2>
            <p className={`text-xs mt-0.5 ${secondaryText}`}>
              Pre-configured high-stakes interview simulators mirroring actual technical rubrics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TRACKS.map(preset => {
            const Icon = preset.icon;
            return (
              <div 
                key={preset.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg ${cardBg} hover:border-green-500/40`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${preset.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-300">
                      {preset.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base mb-1">{preset.name}</h3>
                  <p className={`text-xs mb-3 ${secondaryText}`}>
                    {preset.company} • {preset.difficulty} • {preset.experience}
                  </p>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${secondaryText}`}>
                    {preset.skills}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-green-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Launch Track
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interview History */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" /> Assessment History & Reports
            </h2>
            <p className={`text-xs mt-0.5 ${secondaryText}`}>
              Review evaluations, strengths, areas of improvement, and ideal answers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search role or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${inputBg}`}
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none ${inputBg}`}
            >
              <option value="All">All Formats</option>
              <option value="Technical">Technical</option>
              <option value="System Design">System Design</option>
              <option value="Behavioral">Behavioral</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            <p className={`mt-3 text-xs ${secondaryText}`}>Loading assessment archives...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className={`min-h-[260px] flex flex-col items-center justify-center text-center border-2 border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-200'} rounded-2xl p-8`}>
            <Target className="w-10 h-10 text-green-500 mb-4 opacity-70" />
            <h3 className="text-lg font-bold">No interview sessions found</h3>
            <p className={`mt-1 mb-6 max-w-sm text-xs ${secondaryText}`}>
              {searchTerm ? 'Try adjusting your search query or filter.' : 'Launch an enterprise track above or configure a custom mock session to practice.'}
            </p>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
            >
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredInterviews.map((session) => (
              <div key={session.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${isDark ? 'bg-zinc-900/30 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/60' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white'}`}>
                
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">
                      {session.role}
                    </h3>
                    <span className={`text-xs font-semibold ${secondaryText}`}>
                      @ {session.company || 'Tech Enterprise'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                      {session.difficulty}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                      {session.interview_type}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold ${session.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                      {session.status === 'completed' ? 'EVALUATED' : 'IN PROGRESS'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {session.status === 'completed' && session.evaluation ? (
                    <div className="text-right mr-3 hidden sm:block">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${secondaryText}`}>Rating</p>
                      <p className="text-lg font-black text-green-500">{session.evaluation.overall_score || 0}/10</p>
                    </div>
                  ) : null}

                  <button 
                    onClick={() => navigate(session.status === 'completed' ? `/interviews/feedback/${session.id}` : `/interviews/session/${session.id}`)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      session.status === 'completed'
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20'
                        : isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                    }`}
                  >
                    {session.status === 'completed' ? 'View Dossier' : 'Resume Session'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => handleDelete(session.id)}
                    className={`p-2.5 rounded-xl transition-colors ${isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'}`}
                    title="Delete Interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Configure Enterprise AI Interview"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Target Role *</label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input 
                type="text" name="role" required
                placeholder="e.g., Senior Full Stack Engineer"
                value={formData.role} onChange={handleFormChange}
                className={`w-full pl-10 p-2.5 rounded-xl border outline-none text-sm transition-colors ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Experience Level</label>
              <select name="experience" value={formData.experience} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}>
                <option>Fresher</option>
                <option>1-3 Years</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Interview Mode</label>
              <select name="interview_type" value={formData.interview_type} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}>
                <option>Technical</option>
                <option>System Design</option>
                <option>Behavioral</option>
                <option>HR</option>
                <option>Mixed</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Target Company (Optional)</label>
              <input 
                type="text" name="company"
                placeholder="e.g., Google, Amazon, Stripe"
                value={formData.company} onChange={handleFormChange}
                className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Specific Skills & Topics (Optional)</label>
            <input 
              type="text" name="skills"
              placeholder="e.g., React, Concurrency, PostgreSQL, Microservices"
              value={formData.skills} onChange={handleFormChange}
              className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}
            />
          </div>

          <div className={`pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'} mt-6`}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-70 shadow-md shadow-green-600/20"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Preparing AI Assessment...</>
              ) : (
                <>Launch Live Interview Session <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Interviews;