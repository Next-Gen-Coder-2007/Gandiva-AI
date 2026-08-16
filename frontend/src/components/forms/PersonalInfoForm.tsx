import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, Sparkles } from 'lucide-react';
import { updateResumePersonalInfo, enhanceResumeText } from '../../services/resume';

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

  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onUpdate(updatedData);
    
    if (saveStatus !== 'idle') {
      setSaveStatus('idle');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await updateResumePersonalInfo(id, formData);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving personal info:', error.response?.data || error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
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
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass.replace('mb-2', '')}>Profile Summary</label>
          <button
            type="button"
            onClick={async () => {
              if (!formData.profile_summary?.trim()) return;
              setIsEnhancing(true);
              try {
                const res = await enhanceResumeText({ text: formData.profile_summary, section_type: 'summary' });
                if (res.enhanced_text) {
                  const updated = { ...formData, profile_summary: res.enhanced_text };
                  setFormData(updated);
                  onUpdate(updated);
                }
              } catch (err) {
                console.error("AI enhancement error:", err);
              } finally {
                setIsEnhancing(false);
              }
            }}
            disabled={isEnhancing || !formData.profile_summary?.trim()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all disabled:opacity-40"
          >
            {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
          </button>
        </div>
        <textarea 
          name="profile_summary"
          placeholder="Briefly describe your professional background, core technical skills, and career objective..."
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
          {isSaving ? 'Saving Info...' : 'Save Personal Info'}
        </button>

        {saveStatus === 'success' && (
          <p className="text-green-500 text-sm text-center font-medium animate-pulse">
            Personal info saved successfully!
          </p>
        )}
        {saveStatus === 'error' && (
          <p className="text-red-500 text-sm text-center font-medium">
            Failed to save info. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoForm;