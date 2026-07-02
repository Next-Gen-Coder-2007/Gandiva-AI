import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PlusCircle, UploadCloud, FileText, LayoutGrid, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ResumeDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [modalMode, setModalMode] = useState<'create' | 'upload' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Resumes</h1>
          <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
            Manage, edit, or create new professional resumes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setModalMode('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-colors ${
              isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload
          </button>
          <button 
            onClick={() => setModalMode('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      <div className={`p-8 rounded-3xl border ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-green-500" /> My Resumes
        </h2>
        
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-500/20 rounded-2xl p-8">
          <div className="p-4 rounded-full mb-6 border border-zinc-500/20">
            <FileText className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold">No resumes found</h3>
          <p className={`mt-2 mb-8 max-w-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            You haven't built your professional profile yet. Use our <span className="font-semibold text-green-500">AI Resume Builder</span> to craft an ATS-friendly resume in minutes.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setModalMode('create')}
              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all"
            >
              Create New Resume
            </button>
            <button 
              onClick={() => setModalMode('upload')}
              className={`px-6 py-3 rounded-xl font-semibold border ${
                isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              Upload Existing
            </button>
          </div>
        </div>
      </div>

      {modalMode && ReactDOM.createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}>
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={closeModal} 
          />
          
          <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all duration-300 ${
            isAnimating ? 'scale-100' : 'scale-95'
          } ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create New' : 'Upload Resume'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-zinc-500/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="e.g., Software Engineer - Google" 
                className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-green-500 ${
                  isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              />
              
              {modalMode === 'upload' && (
                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer ${
                  isDark ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-200 hover:border-zinc-300'
                }`}>
                  <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                  <p className="text-sm text-zinc-500">Drag & drop or click to upload</p>
                </div>
              )}

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold mt-2 transition-all">
                {modalMode === 'create' ? 'Create Resume' : 'Upload File'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResumeDashboard;