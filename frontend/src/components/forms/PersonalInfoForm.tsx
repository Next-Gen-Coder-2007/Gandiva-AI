import React, { useState, useEffect } from 'react';
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
}

const PersonalInfoForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState<PersonalInfo>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    profile_summary: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });

  useEffect(() => {
    if (data) {
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        profile_summary: data.profile_summary || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        portfolio: data.portfolio || '',
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateResumePersonalInfo(id, formData);
    } catch (error: any) {
      console.error('Error saving personal info:', error.response?.data || error.message);
    }
  };

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Full Name', name: 'full_name', type: 'text', placeholder: 'Enter your Name' },
          { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your Email' },
          { label: 'Phone', name: 'phone', type: 'tel', placeholder: 'Enter your Phone Number' },
          { label: 'Location', name: 'location', type: 'text', placeholder: 'Enter your Location' },
        ].map((field) => (
          <div key={field.name}>
            <label className={labelClass}>{field.label}</label>
            <input 
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name as keyof PersonalInfo]}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label className={labelClass}>Profile Summary</label>
        <textarea 
          name="profile_summary"
          placeholder="A brief professional summary about yourself..."
          value={formData.profile_summary}
          onChange={handleChange}
          className={`${inputClass} h-32 resize-none`} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'LinkedIn URL', name: 'linkedin', placeholder: 'linkedin.com/in/username' },
          { label: 'GitHub URL', name: 'github', placeholder: 'github.com/username' },
          { label: 'Portfolio URL', name: 'portfolio', placeholder: 'yourportfolio.com' },
        ].map((field) => (
          <div key={field.name}>
            <label className={labelClass}>{field.label}</label>
            <input 
              name={field.name}
              type="url"
              placeholder={field.placeholder}
              value={formData[field.name as keyof PersonalInfo]}
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