import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

const ExperiencesForm: React.FC = () => {
  const { isDark } = useTheme();
  
  // State for the list of experience entries
  const [experiences, setExperiences] = useState<any[]>([]);
  // State for the active form fields
  const [formData, setFormData] = useState({
    company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: ''
  });

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  const addExperience = () => {
    if (formData.company && formData.role) {
      setExperiences([...experiences, formData]);
      setFormData({ company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
    }
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Experience Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input className={inputClass} value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="Company Name" />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input className={inputClass} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="Job Title" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input className={inputClass} value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="City, Country" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" className={inputClass} value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} disabled={formData.currently_working} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={formData.currently_working}
          onChange={(e) => setFormData({...formData, currently_working: e.target.checked})}
          className="w-4 h-4 accent-green-600"
        />
        <label className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>I am currently working here</label>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea className={`${inputClass} h-24`} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Key responsibilities..." />
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
        <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Save All Experience
        </button>
      )}
    </div>
  );
};

export default ExperiencesForm;