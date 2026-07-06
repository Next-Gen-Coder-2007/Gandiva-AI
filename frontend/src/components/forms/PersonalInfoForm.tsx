import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { updateResumePersonalInfo } from '../../services/resume';

interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  profile_summary: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface Props {
  id: number;
  data: PersonalInfo | null;
  onUpdate: (data: any) => void;
}

const placeholders: Record<string, string> = {
  full_name: 'Enter your Name',
  email: 'Enter your Mail',
  phone: 'Enter your Mobile Number',
  location: 'City, Country',
  linkedin: 'linkedin.com/in/username',
  github: 'github.com/username',
  portfolio: 'yourportfolio.com',
};

const PersonalInfoForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<PersonalInfo>(data || {
    full_name: '', email: '', phone: '', location: '',
    profile_summary: '', linkedin: '', github: '', portfolio: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
  };

  const handleSave = async () => {
    try {
      await updateResumePersonalInfo(id, formData);
    } catch (error: any) {
      console.error('Error saving personal info:', error.response?.data || error.message);
    }
  };

  const formatLabel = (str: string) => {
    const label = str.replace('_', ' ');
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark ? 'bg-black border-zinc-800 text-white focus:border-green-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['full_name', 'email', 'phone', 'location'].map((key) => (
          <div key={key}>
            <label className={labelClass}>{formatLabel(key)}</label>
            <input 
              name={key}
              placeholder={placeholders[key]}
              value={formData[key as keyof PersonalInfo] || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label className={labelClass}>Profile summary</label>
        <textarea 
          name="profile_summary"
          placeholder="Briefly describe your professional background..."
          value={formData.profile_summary || ""}
          onChange={handleChange}
          className={`${inputClass} h-32 resize-none`} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['linkedin', 'github', 'portfolio'].map((key) => (
          <div key={key}>
            <label className={labelClass}>{formatLabel(key)}</label>
            <input 
              name={key}
              placeholder={placeholders[key]}
              value={formData[key as keyof PersonalInfo] || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
      >
        Save Personal Info
      </button>
    </div>
  );
};

export default PersonalInfoForm;