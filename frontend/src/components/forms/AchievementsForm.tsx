import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { updateResumeAchievements } from '../../services/resume';

interface Achievement {
  title: string;
  description: string;
}

interface Props {
  id: number;
  data: Achievement[] | null;
  onUpdate: (data: any) => void;
}

const AchievementsForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [achievements, setAchievements] = useState<Achievement[]>(data || []);
  const [current, setCurrent] = useState<Achievement>({ title: '', description: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: keyof Achievement, value: string) => {
    setCurrent({ ...current, [field]: value });
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const addAchievement = () => {
    if (current.title.trim()) {
      const updatedList = [...achievements, current];      
      setAchievements(updatedList);      
      onUpdate(updatedList);      
      setCurrent({ title: '', description: '' });
      setSaveStatus('idle');
    }
  };

  const removeAchievement = (index: number) => {
    const updatedList = achievements.filter((_, i) => i !== index);
    setAchievements(updatedList);    
    onUpdate(updatedList);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeAchievements(id, achievements);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch(err: any) {
      console.error("Error updating Achievements:", err.response?.detail || err.message);
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
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input 
            type="text" 
            placeholder="e.g., Winner of Hackathon 2026" 
            className={inputClass}
            value={current.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea 
            placeholder="Describe your achievement..." 
            className={`${inputClass} h-24 resize-none`}
            value={current.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>
        <button
          onClick={addAchievement}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-colors ${
            isDark
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-600'
          }`}
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      <div className="space-y-3">
        {achievements.map((item, index) => (
          <div key={index} className={`p-4 rounded-xl border flex justify-between items-start ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm opacity-70 mt-1">{item.description}</p>
            </div>
            <button onClick={() => removeAchievement(index)} className="text-red-500 hover:text-red-600 ml-4">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {achievements.length > 0 && (
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
            {isSaving ? 'Saving Achievements...' : 'Save All Achievements'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Achievements saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save achievements. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementsForm;