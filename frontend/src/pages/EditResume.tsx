import React, { useEffect, useState } from 'react';
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

import ResumePreview from '../components/ResumePreview';

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

  if (!resumeData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
        <p className="animate-pulse">Loading resume data...</p>
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
            setResumeData((prev: any) => ({
              ...prev,
              ...updatedPersonalInfo
            }));
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
  ]
  
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

        <div className={`sticky top-24 rounded-3xl h-[800px] overflow-hidden border ${
            isDark ? 'border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'border-zinc-300 shadow-xl'
        }`}>
            <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  );
};

export default EditResume;