import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import PersonalInfoForm from '../components/forms/PersonalInfoForm';
import SkillsForm from '../components/forms/SkillsForm';
import LanguageForm from '../components/forms/LanguagesForm';
import EducationForm from '../components/forms/EducationsForm';
import ExperienceForm from '../components/forms/ExperiencesForm';
import ProjectForm from '../components/forms/ProjectsForm';
import AchievementForm from '../components/forms/AchievementsForm';
import CertificateForm from '../components/forms/CertificatesForm';

import { getResumeById } from '../services/resume';

const EditResume: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { id } = useParams<{ id: string }>();
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (id) {
        try {
          const response = await getResumeById(Number(id));
          setResumeData(response.data);
          console.log('Fetched Resume:', response.data);
        } catch (error) {
          console.error('Error fetching resume:', error);
        }
      }
    };
    fetchResume();
  }, [id]);

  const sections = useMemo(() => [
    { name: 'Personal Info', component: <PersonalInfoForm id={Number(id)} data={resumeData} /> },
    { name: 'Skills', component: <SkillsForm id={Number(id)} data={resumeData?.skills} /> },
    { name: 'Languages', component: <LanguageForm id={Number(id)} data={resumeData?.languages} /> },
    { name: 'Education', component: <EducationForm id={Number(id)} data={resumeData?.educations} /> },
    { name: 'Experience', component: <ExperienceForm id={Number(id)} data={resumeData?.experiences} /> },
    { name: 'Projects', component: <ProjectForm id={Number(id)} data={resumeData?.projects} /> },
    { name: 'Achievements', component: <AchievementForm id={Number(id)} data={resumeData?.achievements} /> },
    { name: 'Certificates', component: <CertificateForm id={Number(id)} data={resumeData?.certificates} /> },
  ], [resumeData]);
  
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === sections.length - 1;

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      <button 
        onClick={() => navigate('/resumes')} 
        className="flex items-center gap-2 mb-8 opacity-60 hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" /> Back to resumes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className={`p-8 rounded-3xl border h-fit ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{sections[activeStep].name}</h2>
            <div className="flex gap-2">
              <button 
                disabled={isFirstStep}
                onClick={() => setActiveStep(prev => prev - 1)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  isFirstStep ? 'opacity-30 cursor-not-allowed' : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'
                }`}
              >
                Previous
              </button>
              <button 
                disabled={isLastStep}
                onClick={() => setActiveStep(prev => prev + 1)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  isLastStep ? 'opacity-30 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
          
          {sections[activeStep].component}
        </div>

        <div className={`sticky top-24 border-2 border-dashed rounded-3xl h-[600px] flex items-center justify-center ${
            isDark ? 'border-zinc-800 bg-zinc-900/20 text-zinc-600' : 'border-zinc-200 bg-zinc-50 text-zinc-400'
        }`}>
            <p>Resume Preview (Implemented in future)</p>
        </div>
      </div>
    </div>
  );
};

export default EditResume;