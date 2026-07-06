import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumePreview from '../components/ResumePreview';
import { getResumeById } from '../services/resume'; 
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Printer, Loader2, AlertCircle, Info } from 'lucide-react';

const ResumeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await getResumeById(Number(id));
        setResumeData(response.data || response); 
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load the resume.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [id]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className={`mt-4 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Loading professional profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-sans p-4 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
        <div className={`p-8 rounded-3xl border flex flex-col items-center text-center max-w-md w-full shadow-sm ${
          isDark
            ? 'bg-zinc-900/40 border-red-900/30'
            : 'bg-white border-zinc-200/80'
        }`}>
          <div className={`p-4 rounded-2xl mb-5 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Unable to load resume
          </h3>
          <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {error}
          </p>
          <button 
            onClick={() => navigate('/resumes')}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
            }`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              margin: 0;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
          }
        `}
      </style>

      <div className={`min-h-screen p-4 sm:p-8 font-sans print:p-0 print:bg-white flex flex-col items-center ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
        
        <div className={`w-full max-w-[210mm] mb-8 p-5 rounded-2xl border flex items-start gap-4 text-sm transition-colors print:hidden ${
          isDark
            ? 'bg-zinc-900/50 border-zinc-800'
            : 'bg-white border-zinc-200/80 shadow-sm'
        }`}>
          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <Info className="w-5 h-5" />
          </div>
          <div className={`leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <strong className={`font-semibold text-base block mb-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              PDF Export Guide
            </strong>
            To save a digital copy, click the Print button below and change the destination to <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>"Save as PDF"</strong>.
          </div>
        </div>

        <div className="w-full max-w-[210mm] flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 print:hidden">
          
          <button 
            onClick={() => navigate('/resumes')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-colors ${
              isDark 
                ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white' 
                : 'border-zinc-200 hover:bg-white bg-zinc-50 text-zinc-700 hover:text-zinc-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resumes
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Resume
            </button>
          </div>
        </div>

        <div 
          id="print-section"
          className="w-full max-w-[210mm] shadow-xl bg-white print:shadow-none print:w-full print:max-w-none print:m-0 print:p-0 rounded-sm print:rounded-none"
        >
          <ResumePreview 
            data={resumeData} 
            layoutTheme={resumeData?.theme || 'professional'}
            colorTheme={resumeData?.color || 'emerald'}
          />
        </div>
        
      </div>
    </>
  );
};

export default ResumeView;