import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react';
import { updateResumeExperiences, enhanceResumeText } from '../../services/resume';

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

  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof Experience, value: any) => {
    setCurrent({ ...current, [field]: value });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const addExperience = () => {
    if (current.company.trim() && current.role.trim()) {
      const updatedList = [...experiences, current];
      setExperiences(updatedList);
      onUpdate(updatedList);
      setCurrent({ company: '', role: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
      setSaveStatus('idle');
    }
  };

  const removeExperience = (index: number) => {
    const updatedList = experiences.filter((_, i) => i !== index);
    setExperiences(updatedList);
    onUpdate(updatedList);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeExperiences(id, experiences);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving experiences:', error.response?.data || error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
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
          <input className={inputClass} value={current.company} onChange={(e) => handleInputChange('company', e.target.value)} placeholder="Company Name" />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input className={inputClass} value={current.role} onChange={(e) => handleInputChange('role', e.target.value)} placeholder="Job Title" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input className={inputClass} value={current.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="City, Country" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" className={inputClass} value={current.start_date} onChange={(e) => handleInputChange('start_date', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input type="date" className={inputClass} value={current.end_date} onChange={(e) => handleInputChange('end_date', e.target.value)} disabled={current.currently_working} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={current.currently_working}
          onChange={(e) => {
            handleInputChange('currently_working', e.target.checked);
            if (e.target.checked) handleInputChange('end_date', '');
          }}
          className="w-4 h-4 accent-green-600"
        />
        <label className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>I am currently working here</label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass.replace('mb-2', '')}>Description / Bullet Points</label>
          <button
            type="button"
            onClick={async () => {
              if (!current.description.trim()) return;
              setIsEnhancing(true);
              try {
                const res = await enhanceResumeText({ text: current.description, section_type: 'bullet', role: current.role });
                if (res.enhanced_text) {
                  handleInputChange('description', res.enhanced_text);
                }
              } catch (err) {
                console.error("AI enhancement error:", err);
              } finally {
                setIsEnhancing(false);
              }
            }}
            disabled={isEnhancing || !current.description.trim()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all disabled:opacity-40"
          >
            {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isEnhancing ? 'Optimizing...' : 'Enhance with AI'}
          </button>
        </div>
        <textarea className={`${inputClass} h-24`} value={current.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Key responsibilities, achievements, technologies used (XYZ formula)..." />
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
            {isSaving ? 'Saving Experiences...' : 'Save All Experiences'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Experiences saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save experiences. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExperiencesForm;