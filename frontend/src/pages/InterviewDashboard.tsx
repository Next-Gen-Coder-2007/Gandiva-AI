import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, MessageSquare, Target, Activity, Trash2, ArrowRight, Briefcase, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getInterviews, deleteInterview, createInterview } from '../services/interview';
import Modal from '../components/Modal'; // Assuming standard import path

const InterviewDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const cardBg = isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200';
  const inputBg = isDark ? 'bg-black border-zinc-800 focus:border-green-500' : 'bg-zinc-50 border-zinc-200 focus:border-green-500';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
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
    
    if (completed.length === 0) return 0;
    
    const total = completed.reduce((acc, curr) => acc + (curr.evaluation.overall_score || 0), 0);
    return (total / completed.length).toFixed(1);
  };

  // Form Handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      navigate(`/interviews/session/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create interview session. Please try again.");
      setIsSubmitting(false);
    }
  };

  const safeInterviewsList = Array.isArray(interviews) ? interviews : [];
  const completedCount = safeInterviewsList.filter(i => i.status === 'completed').length;

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-7xl mx-auto font-sans ${bgColor} ${textColor}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mock Interviews</h1>
          <p className={`mt-2 ${secondaryText}`}>Master your next interview with AI-powered practice sessions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> New Interview
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <MessageSquare className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${secondaryText}`}>Total Sessions</p>
              <h3 className="text-2xl font-bold">{safeInterviewsList.length}</h3>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <Target className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${secondaryText}`}>Completed</p>
              <h3 className="text-2xl font-bold">{completedCount}</h3>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className={`text-sm font-semibold uppercase tracking-wider ${secondaryText}`}>Avg. Score</p>
              <h3 className="text-2xl font-bold">{calculateAverageScore()} / 10</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${isDark ? 'border-zinc-900 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">Recent Sessions</h2>
        
        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        ) : safeInterviewsList.length === 0 ? (
          <div className={`min-h-[300px] flex flex-col items-center justify-center text-center border-2 border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-200'} rounded-2xl p-8`}>
            <Target className="w-10 h-10 text-green-500 mb-6" />
            <h3 className="text-xl font-bold">No interviews yet</h3>
            <p className={`mt-2 mb-6 max-w-sm ${secondaryText}`}>
              Start practicing today. Our AI will evaluate your answers and provide detailed feedback.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold">Start Practicing</button>
          </div>
        ) : (
            <div className="space-y-4">
            {safeInterviewsList.map((session, index, array) => {
              const identicalSessions = array.filter(
                s => s.role === session.role && s.company === session.company && s.difficulty === session.difficulty
              ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              
              const attemptNumber = identicalSessions.findIndex(s => s.id === session.id) + 1;
              const hasMultipleAttempts = identicalSessions.length > 1;

              return (
                <div key={session.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${cardBg} ${isDark ? 'hover:border-zinc-700' : 'hover:border-zinc-300 shadow-sm'}`}>
                  
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">
                        {session.role} <span className={`text-sm font-normal ${secondaryText}`}>at {session.company || 'Tech Company'}</span>
                      </h3>
                      {/* NEW: Attempt Badge */}
                      {hasMultipleAttempts && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                          Attempt {attemptNumber}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                        {session.difficulty}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                        {session.interview_type}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${session.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.status === 'completed' ? (
                      <div className="text-right mr-4 hidden sm:block">
                        <p className={`text-xs font-bold uppercase tracking-wider ${secondaryText}`}>Score</p>
                        <p className="text-xl font-bold text-green-500">{session.evaluation?.overall_score || 0}/10</p>
                      </div>
                    ) : null}

                    <button 
                      onClick={() => navigate(session.status === 'completed' ? `/interviews/feedback/${session.id}` : `/interviews/session/${session.id}`)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'}`}
                    >
                      {session.status === 'completed' ? 'View Report' : 'Resume'} <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Configure AI Interview"
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
                placeholder="e.g., Frontend Developer"
                value={formData.role} onChange={handleFormChange}
                className={`w-full pl-10 p-2.5 rounded-xl border outline-none text-sm transition-colors ${inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Experience</label>
              <select name="experience" value={formData.experience} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm appearance-none ${inputBg}`}>
                <option>Fresher</option>
                <option>1-3 Years</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm appearance-none ${inputBg}`}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Type</label>
              <select name="interview_type" value={formData.interview_type} onChange={handleFormChange} className={`w-full p-2.5 rounded-xl border outline-none text-sm appearance-none ${inputBg}`}>
                <option>Technical</option>
                <option>Behavioral</option>
                <option>System Design</option>
                <option>HR</option>
                <option>Mixed</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Company (Opt)</label>
              <input 
                type="text" name="company"
                placeholder="e.g., Google"
                value={formData.company} onChange={handleFormChange}
                className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${secondaryText}`}>Specific Skills to Test (Optional)</label>
            <input 
              type="text" name="skills"
              placeholder="e.g., React, Node.js, System Architecture"
              value={formData.skills} onChange={handleFormChange}
              className={`w-full p-2.5 rounded-xl border outline-none text-sm ${inputBg}`}
            />
          </div>

          <div className={`pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'} mt-6`}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Session...</>
              ) : (
                <>Start Interview <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default InterviewDashboard;