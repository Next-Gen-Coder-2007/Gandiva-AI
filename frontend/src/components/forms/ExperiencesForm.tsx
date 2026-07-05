import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
import { updateResumeExperiences } from '../../services/resume';

interface Experience {
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
}

interface Props {
  id: number;
  data: Experience[] | null;
  onUpdate: (data: any) => void;
}

const ExperiencesForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [experiences, setExperiences] = useState<Experience[]>(data || []);
  const [current, setCurrent] = useState<Experience>({
    company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: ''
  });


  const addExperience = () => {
    if (current.company.trim() && current.role.trim()) {
      const updatedList = [...experiences, current];
      setExperiences(updatedList);
      onUpdate(updatedList);
      setCurrent({ company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
    }
  };

  const removeExperience = (index: number) => {
    const updatedList = experiences.filter((_, i) => i !== index)
    setExperiences(updatedList);
    onUpdate(updatedList);
  };

  const handleSave = async () => {
    try {
      await updateResumeExperiences(id, experiences);
    } catch (error: any) {
      console.error('Error saving experiences:', error.response?.data || error.message);
    }
  }

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark ? 'bg-black border-zinc-800 text-white focus:border-green-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input className={inputClass} value={current.company} onChange={(e) => setCurrent({...current, company: e.target.value})} placeholder="Company Name" />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input className={inputClass} value={current.role} onChange={(e) => setCurrent({...current, role: e.target.value})} placeholder="Job Title" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input className={inputClass} value={current.location} onChange={(e) => setCurrent({...current, location: e.target.value})} placeholder="City, Country" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={current.start_date} onChange={(e) => setCurrent({...current, start_date: e.target.value})} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" className={inputClass} value={current.end_date} onChange={(e) => setCurrent({...current, end_date: e.target.value})} disabled={current.currently_working} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={current.currently_working}
          onChange={(e) => setCurrent({...current, currently_working: e.target.checked})}
          className="w-4 h-4 accent-green-600"
        />
        <label className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>I am currently working here</label>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea className={`${inputClass} h-24`} value={current.description} onChange={(e) => setCurrent({...current, description: e.target.value})} placeholder="Key responsibilities..." />
      </div>

      <button 
        onClick={addExperience} 
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-colors ${
          isDark
            ? 'bg-white text-black hover:bg-zinc-200'
            : 'bg-black text-white hover:bg-zinc-600'
        }`}
      >
        <Plus className="w-4 h-4" /> Add Experience
      </button>

      <div className="space-y-3 mt-4">
        {experiences.map((item, index) => (
          <div key={index} className={`p-4 rounded-xl border flex justify-between items-start ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{item.company}</p>
              <p className="text-sm opacity-70">{item.role}</p>
            </div>
            <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {experiences.length > 0 && (
        <button onClick={handleSave} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Save All Experience
        </button>
      )}
    </div>
  );
};

export default ExperiencesForm;