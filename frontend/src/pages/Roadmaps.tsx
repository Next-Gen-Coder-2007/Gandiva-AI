import React, { useState, useEffect } from 'react';
import { Map, Sparkles, Target, Loader2, Trash2, ChevronRight, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { getAllRoadmaps, generateRoadmap, deleteRoadmap, type Roadmap } from '../services/roadmap';

const Roadmaps: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    try {
      const response = await getAllRoadmaps();
      setRoadmaps(response.data || []);
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!targetRole.trim()) return;

    setIsGenerating(true);
    try {
      const response = await generateRoadmap(targetRole.trim());
      setIsModalOpen(false);
      setTargetRole('');
      navigate(`/roadmaps/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await deleteRoadmap(id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Career Roadmaps</h1>
        <p className={`mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Generate highly detailed, step-by-step learning paths based on your career targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
            isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-900 text-green-400' : 'bg-green-50 text-green-600'}`}>
              <Map className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Create New Roadmap</h2>
            <p className={`max-w-md mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Define your target role. Our AI will build a comprehensive curriculum complete with projects, interview prep, and resources.
            </p>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate Roadmap
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" /> Your Current Goals
          </h2>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-500/20 text-center">
                <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>No active roadmaps found.</p>
              </div>
            ) : (
              roadmaps.map((roadmap) => (
                <div key={roadmap.id} className={`group relative p-4 rounded-xl border transition-all hover:-translate-y-1 ${
                  isDark ? 'border-zinc-800 bg-zinc-900/30 hover:border-green-500/30' : 'border-zinc-200 bg-zinc-50 hover:border-green-500/40 hover:shadow-md'
                }`}>
                  <button 
                    onClick={() => handleDelete(roadmap.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-base mb-1 truncate pr-8">{roadmap.target_role}</h3>
                  <p className={`text-xs mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Created: {new Date(roadmap.created_at).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => navigate(`/roadmaps/${roadmap.id}`)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                      isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-white border border-zinc-200 hover:bg-zinc-100 text-black'
                    }`}
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isGenerating && setIsModalOpen(false)} title="Target Career Goal">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg flex items-start gap-2 border bg-red-500/10 border-red-500/20 text-red-500">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className={`text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              What role are you aiming for?
            </label>
            <input
              type="text"
              required
              autoFocus
              disabled={isGenerating}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Machine Learning Engineer"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-green-500' 
                  : 'bg-white border-zinc-300 text-black placeholder-zinc-400 focus:border-green-500'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !targetRole.trim()}
            className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Structuring highly detailed roadmap...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Curriculum</>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Roadmaps;