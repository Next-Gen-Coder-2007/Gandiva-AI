import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PlusCircle, UploadCloud, FileText, LayoutGrid, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { createResume, getAllResumes } from '../services/resume';

const Resumes: React.FC = () => {
  const { isDark } = useTheme();
  const [modalMode, setModalMode] = useState<'create' | 'upload' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [resumeName, setResumeName] = useState("");

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setModalMode(null), 200);
  };

  useEffect(() => {
    if (modalMode) {
      setIsAnimating(true);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [modalMode]);

  const fetchResumes = async () => {
    try {
      const { data } = await getAllResumes();
      setResumes(data);
    } catch (err) { console.error("Failed to fetch resumes"); }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleCreate = async () => {
    if (!resumeName.trim()) return;
    try {
      await createResume(resumeName);
      await fetchResumes();
      setResumeName("");
      closeModal();
    } catch (err) { alert("Error creating resume"); }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 max-w-7xl mx-auto font-sans ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Resumes</h1>
          <p className={isDark ? 'text-zinc-400' : 'text-zinc-600 mt-1'}>
            Manage, edit, or create new professional resumes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalMode('upload')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${isDark ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <UploadCloud className="w-4 h-4" /> Upload
          </button>
          <button onClick={() => setModalMode('create')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold shadow-lg shadow-green-500/20 transition-all">
            <PlusCircle className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      <div className={`p-8 rounded-3xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-green-500" /> My Resumes
        </h2>
        
        {resumes.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-3 border-dashed border-zinc-800 rounded-2xl p-8">
            <FileText className="w-10 h-10 text-green-500 mb-6" />
            <h3 className="text-xl font-bold">No resumes found</h3>
            <p className={`mt-2 mb-8 max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              You haven't built your professional profile yet. Use our <span className="font-semibold text-green-500">AI Resume Builder</span> to craft an ATS-friendly resume in minutes.
            </p>
            <button onClick={() => setModalMode('create')} className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold">Create New Resume</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resumes.map((r: any) => (
              <div key={r.id} className={`p-6 rounded-2xl border transition-all hover:border-green-500 hover:shadow-xl ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <FileText className="w-8 h-8 text-green-500 mb-4" />
                <h4 className="font-bold text-lg">{r.name}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalMode && ReactDOM.createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all duration-300 ${isAnimating ? 'scale-100' : 'scale-95'} ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{modalMode === 'create' ? 'Create New Resume' : 'Upload Resume'}</h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-zinc-500/10 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <input 
              placeholder="e.g., Software Engineer - Google" 
              className={`w-full p-4 mb-4 rounded-xl border outline-none focus:ring-2 focus:ring-green-500 ${isDark ? 'bg-black border-zinc-700' : 'bg-white border-zinc-200'}`}
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
            />
            
            {modalMode === 'upload' && (
              <div className={`border-2 border-dashed rounded-2xl p-10 mb-4 flex flex-col items-center justify-center cursor-pointer ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                <p className="text-sm text-zinc-500">Drag & drop or click to upload</p>
              </div>
            )}

            <button onClick={modalMode === 'create' ? handleCreate : undefined} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all">
              {modalMode === 'create' ? 'Create Resume' : 'Upload File'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Resumes;