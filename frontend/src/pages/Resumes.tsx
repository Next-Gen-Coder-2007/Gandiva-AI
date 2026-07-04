import React, { useState, useEffect } from 'react';
import { PlusCircle, UploadCloud, FileText, LayoutGrid, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { createResume, getAllResumes, deleteResume } from '../services/resume';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Resumes: React.FC = () => {
  const { isDark } = useTheme();
  const [modalMode, setModalMode] = useState<'create' | 'upload' | 'confirmDelete' | null>(null);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeTitle, setResumeTitle] = useState("");
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllResumes();
      setResumes(data);
    } catch (err) {
      console.error("Failed to fetch resumes");
    } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreate = async () => {
    if (!resumeTitle.trim()) {
      setErrorMessage("Title is required");
      return;
    }
    try {
      await createResume(resumeTitle);
      await fetchResumes();
      setResumeTitle("");
      setModalMode(null);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage("Failed to create resume. Please try again.");
    }
  };

  const handleDeleteClick = (id: number) => {
    setTargetId(id);
    setModalMode('confirmDelete');
  };

  const confirmDelete = async () => {
    if (!targetId) return;
    try {
      await deleteResume(targetId);
      await fetchResumes();
      setModalMode(null);
    } catch (err) {
      setErrorMessage("Failed to delete resume.");
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-7xl mx-auto font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Resumes</h1>
          <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Manage and build your professional profile.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalMode('upload')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border ${isDark ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-zinc-50'}`}>
            <UploadCloud className="w-4 h-4" /> Upload
          </button>
          <button onClick={() => setModalMode('create')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      <div className={`p-6 sm:p-8 rounded-3xl border ${isDark ? 'border-zinc-900 bg-zinc-950/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-green-500" /> Recent Resumes
        </h2>
        
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
            <p className="mt-4 font-medium">Loading your resumes...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-3 border-dashed border-zinc-800 rounded-2xl p-8">
            <FileText className="w-10 h-10 text-green-500 mb-6" />
            <h3 className="text-xl font-bold">No resumes found</h3>
            <p className={`mt-2 mb-8 max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              You haven't built your professional profile yet. Use our <span className="font-semibold text-green-500">AI Resume Builder</span> to craft an ATS-friendly resume in minutes.
            </p>
            <button onClick={() => setModalMode('create')} className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold">Create New Resume</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resumes.map((r: any) => (
              <div key={r.id} className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${isDark ? 'bg-black border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>

                  <h2 className="font-bold flex-1 truncate">
                    {r.title}
                  </h2>
                </div>
                <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Actions</span>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-zinc-500/10 text-green-500 cursor-pointer"><Eye className="w-4 h-4" /></button>
                    <button 
                      className="p-2 rounded-lg hover:bg-zinc-500/10 text-blue-500 cursor-pointer"
                      onClick={() => navigate(`/resumes/edit-resume/${r.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer" onClick={() => handleDeleteClick(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!modalMode} 
        onClose={() => setModalMode(null)} 
        title={modalMode === 'create' ? 'Create New Resume' : modalMode === 'confirmDelete' ? 'Confirm Delete' : 'Upload Resume'}
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {errorMessage}
          </div>
        )}

        {modalMode === 'confirmDelete' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold">Delete Resume</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Are you sure you want to permanently delete this resume? This action will remove all associated data and 
                  <span className="font-semibold text-red-500"> cannot be undone</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={() => setModalMode(null)} 
                className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                  isDark 
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white' 
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-sm shadow-red-900/20"
              >
                Delete Forever
              </button>
            </div>
          </div>
        )}

        {modalMode === 'create' && (
          <>
            <input 
              placeholder="e.g., Software Engineer - Google" 
              className={`w-full p-3 mb-4 rounded-xl border outline-none ${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
              value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)}
            />
            <button onClick={handleCreate} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700">Create Resume</button>
            </>
        )}

        {modalMode === 'upload' && (
          <>
            <input 
              placeholder="Give your resume a title" 
              className={`w-full p-3 mb-4 rounded-xl border outline-none ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'}`}
            />

            <div className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'}`}>
              <UploadCloud className="w-8 h-8 text-green-500 mb-3" />
              <p className="text-sm font-medium">Click or drag & drop</p>
              <p className="text-xs text-zinc-500 mt-1">PDF, DOCX up to 10MB</p>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
              Upload File
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Resumes;