import React, { useState } from 'react';
import { Upload, BrainCircuit, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadResume } from '../services/resume';
import { useTheme } from '../context/ThemeContext';

const ResumeBuilder: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Frontend validation: Size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await uploadResume(file);
      setResult(res.data);
    } catch (err) {
      setError("Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 sm:p-8 max-w-5xl mx-auto ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Resume Builder</h1>
        <p className={`mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Upload your resume to extract text and prepare for AI-powered optimization.
        </p>
      </div>

      {/* Upload Section */}
      <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
        isDark ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-200 bg-white'
      }`}>
        <input type="file" id="resume-upload" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
        <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
          <span className="font-bold text-lg">Click to upload or drag and drop</span>
          <span className="text-sm opacity-60">PDF or DOCX (Max 5MB)</span>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Preview & AI Action */}
      {result && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5" /> Extraction Successful</h2>
              <span className="text-xs font-mono opacity-50">{result.filename}</span>
            </div>
            <pre className={`text-sm p-4 rounded-lg overflow-y-auto max-h-64 font-mono ${isDark ? 'bg-black text-zinc-400' : 'bg-zinc-100 text-zinc-700'}`}>
              {result.text_preview}
            </pre>
          </div>

          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between`}>
            <div>
              <h3 className="font-bold">AI Resume Analyzer</h3>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Unlock ATS scoring and keyword suggestions.</p>
            </div>
            <button disabled className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-500 font-bold rounded-xl cursor-not-allowed">
              <BrainCircuit className="w-5 h-5" />
              Coming Soon
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center font-medium animate-pulse">Processing file...</div>
      )}
    </div>
  );
};

export default ResumeBuilder;