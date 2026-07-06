import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { updateResumeSkills } from '../../services/resume';

interface SkillItem {
  category: string;
  skill: string;
}

interface Props {
  id: number;
  data: SkillItem[] | null;
  onUpdate: (data: any) => void;
}

const SkillsForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [skillsList, setSkillsList] = useState<SkillItem[]>(data || []);
  const [current, setCurrent] = useState<SkillItem>({ category: '', skill: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addSkill = () => {
    if (current.category.trim() && current.skill.trim()) {
      const updatedList = [...skillsList, current];
      setSkillsList(updatedList);
      onUpdate(updatedList);
      setCurrent({ ...current, skill: '' });
      setSaveStatus('idle');
    }
  };

  const removeSkill = (index: number) => {
    const updatedList = skillsList.filter((_, i) => i !== index);
    setSkillsList(updatedList);
    onUpdate(updatedList);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeSkills(id, skillsList);
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving skills:', error.response?.data || error.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          placeholder="Category (e.g., Frontend)" 
          className={inputClass}
          value={current.category}
          onChange={(e) => {
            setCurrent({...current, category: e.target.value});
            if (saveStatus !== 'idle') setSaveStatus('idle'); // Clear status on typing
          }}
        />
        <div className="flex gap-2">
          <input 
            placeholder="Skill (e.g., React)" 
            className={inputClass}
            value={current.skill}
            onChange={(e) => {
              setCurrent({...current, skill: e.target.value});
              if (saveStatus !== 'idle') setSaveStatus('idle'); // Clear status on typing
            }}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          />
          <button 
            onClick={addSkill}
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {skillsList.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className="font-medium">
              <span className="text-green-500 mr-2">[{item.category}]</span> 
              {item.skill}
            </span>
            <button 
              onClick={() => removeSkill(index)} 
              className="text-red-500 hover:text-red-600 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {skillsList.length > 0 && (
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
            {isSaving ? 'Saving Skills...' : 'Save Skills'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Skills saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save skills. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsForm;