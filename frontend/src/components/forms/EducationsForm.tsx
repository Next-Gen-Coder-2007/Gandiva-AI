import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { updateResumeEducations } from '../../services/resume';

interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  description: string;
}

interface Props {
  id: number;
  data: Education[] | null;
  onUpdate: (data: any) => void;
}

const EducationsForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [educations, setEducations] = useState<Education[]>(data || []);
  const [current, setCurrent] = useState<Education>({
    institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof Education, value: string) => {
    setCurrent({ ...current, [field]: value });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const addEducation = () => {
    if (current.institution.trim() && current.degree.trim()) {
      const updatedList = [...educations, current];
      setEducations(updatedList);
      onUpdate(updatedList);
      setCurrent({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: '' });
      setSaveStatus('idle');
    }
  };

  const removeEducation = (index: number) => {
    const updatedList = educations.filter((_, i) => i !== index);
    setEducations(updatedList);
    onUpdate(updatedList);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeEducations(id, educations);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving educations:', error.response?.data || error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Institution</label>
          <input className={inputClass} value={current.institution} onChange={(e) => handleInputChange('institution', e.target.value)} placeholder="University Name" />
        </div>
        <div>
          <label className={labelClass}>Degree</label>
          <input className={inputClass} value={current.degree} onChange={(e) => handleInputChange('degree', e.target.value)} placeholder="e.g., B.Sc" />
        </div>
        <div>
          <label className={labelClass}>Field of Study</label>
          <input className={inputClass} value={current.field_of_study} onChange={(e) => handleInputChange('field_of_study', e.target.value)} placeholder="e.g., Computer Science" />
        </div>
        <div>
          <label className={labelClass}>Grade / GPA</label>
          <input className={inputClass} value={current.grade} onChange={(e) => handleInputChange('grade', e.target.value)} placeholder="e.g., 3.8/4.0" />
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={current.start_date} onChange={(e) => handleInputChange('start_date', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" className={inputClass} value={current.end_date} onChange={(e) => handleInputChange('end_date', e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea className={`${inputClass} h-24`} value={current.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Relevant coursework..." />
      </div>

      <button 
        onClick={addEducation} 
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-colors ${
          isDark
            ? 'bg-white text-black hover:bg-zinc-200'
            : 'bg-black text-white hover:bg-zinc-600'
        }`}
      >
        <Plus className="w-4 h-4" /> Add Education
      </button>

      <div className="space-y-3 mt-4">
        {educations.map((item, index) => (
          <div key={index} className={`p-4 rounded-xl border flex justify-between items-start ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{item.institution}</p>
              <p className="text-sm opacity-70">{item.degree} in {item.field_of_study}</p>
            </div>
            <button onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {educations.length > 0 && (
        <div className="space-y-3 mt-6">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all ${
              isSaving 
                ? 'bg-green-600/70 cursor-not-allowed text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
            }`}
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSaving ? 'Saving Education...' : 'Save All Education'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Education saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save education. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EducationsForm;