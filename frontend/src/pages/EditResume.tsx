import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  LayoutTemplate,
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import SkillsForm from '../components/forms/SkillsForm';
import LanguageForm from '../components/forms/LanguagesForm';
import EducationForm from '../components/forms/EducationsForm';
import ExperienceForm from '../components/forms/ExperiencesForm';
import ProjectForm from '../components/forms/ProjectsForm';
import AchievementForm from '../components/forms/AchievementsForm';
import CertificateForm from '../components/forms/CertificatesForm';

import ResumePreview from '../components/ResumePreview';
import { getResumeById, updateResumeTheme } from '../services/resume';

const EditResume: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      if (id) {
        try {
          const response = await getResumeById(Number(id));
          setResumeData(response.data);
        } catch (error) {
          console.error('Error fetching resume:', error);
        }
      }
    };
    fetchResume();
  }, [id]);

  const handleUpdate = (section: string, updatedData: any) => {
    setResumeData((prev: any) => ({
      ...prev,
      [section]: updatedData,
    }));
  };

  const handleThemeChange = async (type: 'layoutTheme' | 'colorTheme', value: string) => {
    // 1. Optimistically update local state for instant UI feedback
    setResumeData((prev: any) => ({
      ...prev,
      [type]: value,
    }));

    // 2. Determine the payload
    const currentLayout = type === 'layoutTheme' ? value : resumeData?.layoutTheme;
    const currentColor = type === 'colorTheme' ? value : resumeData?.colorTheme;

    // 3. Fire the API call
    try {
      await updateResumeTheme(Number(id), currentLayout, currentColor);
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
    }
  };

  if (!resumeData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-[#000000] text-white' : 'bg-zinc-50 text-zinc-900'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse text-sm text-zinc-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      name: 'Personal Info',
      component: (
        <PersonalInfoForm
          key={`personal-info-${id}`}
          id={Number(id)}
          data={resumeData}
          onUpdate={(updatedPersonalInfo) => {
            setResumeData((prev: any) => ({ ...prev, ...updatedPersonalInfo }));
          }}
        />
      )
    },
    { name: 'Skills', component: <SkillsForm id={Number(id)} data={resumeData?.skills || []} onUpdate={(d) => handleUpdate('skills', d)} /> },
    { name: 'Languages', component: <LanguageForm id={Number(id)} data={resumeData?.languages || []} onUpdate={(d) => handleUpdate('languages', d)} /> },
    { name: 'Education', component: <EducationForm id={Number(id)} data={resumeData?.educations || []} onUpdate={(d) => handleUpdate('educations', d)} /> },
    { name: 'Experience', component: <ExperienceForm id={Number(id)} data={resumeData?.experiences || []} onUpdate={(d) => handleUpdate('experiences', d)} /> },
    { name: 'Projects', component: <ProjectForm id={Number(id)} data={resumeData?.projects || []} onUpdate={(d) => handleUpdate('projects', d)} /> },
    { name: 'Achievements', component: <AchievementForm id={Number(id)} data={resumeData?.achievements || []} onUpdate={(d) => handleUpdate('achievements', d)} /> },
    { name: 'Certificates', component: <CertificateForm id={Number(id)} data={resumeData?.certificates || []} onUpdate={(d) => handleUpdate('certificates', d)} /> },
  ];

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === sections.length - 1;

  const themeColors = [
    { name: 'green', hex: '#16a34a' },
    { name: 'blue', hex: '#2563eb' },
    { name: 'purple', hex: '#9333ea' },
    { name: 'rose', hex: '#e11d48' },
    { name: 'zinc', hex: '#52525b' }
  ];

  const ThemeControls = () => (
    <div className={`p-4 flex flex-wrap items-center justify-between gap-4 shrink-0 border-b ${
      isDark ? 'bg-[#121212] border-zinc-800' : 'bg-white border-zinc-200'
    }`}>
      <div className="flex items-center gap-3">
        <LayoutTemplate className="w-4 h-4 text-zinc-400" />
        <select
          value={resumeData?.layoutTheme || 'professional'}
          onChange={(e) => handleThemeChange('layoutTheme', e.target.value)}
          className={`text-sm font-medium rounded-lg px-3 py-1.5 border outline-none cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#1a1a1a] border-zinc-700 text-zinc-200 hover:bg-[#1e1e1e]'
              : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <option value="professional">Professional</option>
          <option value="modern">Modern</option>
          <option value="creative">Creative</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Palette className="w-4 h-4 text-zinc-400" />
        <div className="flex gap-2">
          {themeColors.map(color => (
            <button
              key={color.name}
              onClick={() => handleThemeChange('colorTheme', color.name)}
              title={color.name}
              className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 shadow-sm ${
                resumeData?.colorTheme === color.name
                  ? 'ring-2 ring-offset-2 ring-green-600 scale-110'
                  : 'hover:ring-2 hover:ring-offset-2 hover:ring-zinc-400'
              } ${isDark ? 'ring-offset-[#121212]' : 'ring-offset-white'}`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.name} theme`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-24 lg:pb-8 font-sans ${
      isDark ? 'bg-[#000000] text-zinc-50' : 'bg-zinc-50 text-zinc-900'
    }`}>
      <header className={`border-b px-4 sm:px-8 py-4 mb-8 ${
        isDark ? 'bg-[#000000] border-zinc-800' : 'bg-white/80 border-zinc-200'
      }`}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/resumes')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Resumes
          </button>

          <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
            <span className={`px-2.5 py-1 rounded-md text-xs tracking-wide uppercase ${
              isDark ? 'bg-[#1a1a1a] text-zinc-400' : 'bg-zinc-100 text-zinc-500'
            }`}>
              Step {activeStep + 1} of {sections.length}
            </span>
            <span className="text-zinc-500">•</span>
            <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>
              {sections[activeStep].name}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${
            isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold tracking-tight">{sections[activeStep].name}</h2>

              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  disabled={isFirstStep}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isFirstStep
                      ? 'opacity-40 cursor-not-allowed'
                      : isDark
                        ? 'bg-[#1a1a1a] hover:bg-[#1e1e1e] text-zinc-200'
                        : 'bg-zinc-100 hover:bg-zinc-200'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={isLastStep}
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isLastStep
                      ? 'opacity-40 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/20 active:scale-95'
                  }`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              {sections[activeStep].component}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-7 flex-col">
          <div className={`flex flex-col flex-1 rounded-2xl overflow-hidden border shadow-lg transition-all ${
            isDark ? 'border-zinc-800 bg-black' : 'border-zinc-200 bg-white'
          }`}>
            <ThemeControls />
            <div className={`flex-1 overflow-y-auto p-4 sm:p-8 ${
              isDark ? 'bg-[#000000]' : 'bg-zinc-50/50'
            }`}>
              <div className="max-w-[800px] mx-auto shadow-xl rounded-sm overflow-hidden bg-white ring-1 ring-black/5">
                <ResumePreview 
                  data={resumeData} 
                  layoutTheme={resumeData?.layoutTheme || 'professional'} 
                  colorTheme={resumeData?.colorTheme || 'green'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all active:scale-95"
      >
        <Eye className="w-5 h-5" />
        Preview
      </button>

      {isMobilePreviewOpen && (
        <div className={`fixed inset-0 z-50 flex flex-col ${
          isDark ? 'bg-[#000000]' : 'bg-zinc-50'
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'bg-[#121212] border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <h3 className="font-bold text-lg">Resume Preview</h3>
            <button
              onClick={() => setIsMobilePreviewOpen(false)}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-[#1a1a1a] text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <ThemeControls />

          <div className="flex-1 overflow-y-auto p-4">
            <div className="w-full shadow-2xl rounded-sm overflow-hidden bg-white mx-auto ring-1 ring-black/5" style={{ maxWidth: '800px' }}>
              <ResumePreview 
                data={resumeData}
                layoutTheme={resumeData?.layoutTheme || 'professional'} 
                colorTheme={resumeData?.colorTheme || 'green'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditResume;