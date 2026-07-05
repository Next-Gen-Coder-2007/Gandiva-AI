import React, { useState, useEffect } from 'react';
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
}

const ExperiencesForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formData, setFormData] = useState<Experience>({
    company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: ''
  });

  // Sync state with incoming parent data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setExperiences(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addExperience = () => {
    if (formData.company.trim() && formData.role.trim()) {
      setExperiences([...experiences, formData]);
      setFormData({ company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
    }
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try  {
      await updateResumeExperiences(id, formData);
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
          <input name="company" className={inputClass} value={formData.company} onChange={handleChange} placeholder="Company Name" />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input name="role" className={inputClass} value={formData.role} onChange={handleChange} placeholder="Job Title" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input name="location" className={inputClass} value={formData.location} onChange={handleChange} placeholder="City, Country" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input name="start_date" type="date" className={inputClass} value={formData.start_date} onChange={handleChange} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input name="end_date" type="date" className={inputClass} value={formData.end_date} onChange={handleChange} disabled={formData.currently_working} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          name="currently_working"
          type="checkbox" 
          checked={formData.currently_working}
          onChange={handleChange}
          className="w-4 h-4 accent-green-600"
        />
        <label className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>I am currently working here</label>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" className={`${inputClass} h-24`} value={formData.description} onChange={handleChange} placeholder="Key responsibilities..." />
      </div>

      <button onClick={addExperience} className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
        <Plus className="w-4 h-4" /> Add Experience
      </button>

      {/* Dynamic List */}
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