import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
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
}

const EducationsForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [educations, setEducations] = useState<Education[]>([]);
  const [current, setCurrent] = useState<Education>({
    institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: ''
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setEducations(data);
    }
  }, [data]);

  const addEducation = () => {
    if (current.institution.trim() && current.degree.trim()) {
      setEducations([...educations, current]);
      setCurrent({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', description: '' });
    }
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateResumeEducations(id, educations);
    } catch (error: any) {
      console.error('Error saving educations:', error.response?.data || error.message);
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
          <input className={inputClass} value={current.institution} onChange={(e) => setCurrent({...current, institution: e.target.value})} placeholder="University Name" />
        </div>
        <div>
          <label className={labelClass}>Degree</label>
          <input className={inputClass} value={current.degree} onChange={(e) => setCurrent({...current, degree: e.target.value})} placeholder="e.g., B.Sc" />
        </div>
        <div>
          <label className={labelClass}>Field of Study</label>
          <input className={inputClass} value={current.field_of_study} onChange={(e) => setCurrent({...current, field_of_study: e.target.value})} placeholder="e.g., Computer Science" />
        </div>
        <div>
          <label className={labelClass}>Grade / GPA</label>
          <input className={inputClass} value={current.grade} onChange={(e) => setCurrent({...current, grade: e.target.value})} placeholder="e.g., 3.8/4.0" />
        </div>
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={current.start_date} onChange={(e) => setCurrent({...current, start_date: e.target.value})} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" className={inputClass} value={current.end_date} onChange={(e) => setCurrent({...current, end_date: e.target.value})} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea className={`${inputClass} h-24`} value={current.description} onChange={(e) => setCurrent({...current, description: e.target.value})} placeholder="Relevant coursework..." />
      </div>

      <button onClick={addEducation} className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
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
        <button onClick={handleSave} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Save All Education
        </button>
      )}
    </div>
  );
};

export default EducationsForm;