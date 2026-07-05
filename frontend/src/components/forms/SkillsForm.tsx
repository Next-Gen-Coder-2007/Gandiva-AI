import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
import { updateResumeSkills } from '../../services/resume';

interface SkillItem {
  category: string;
  skill: string;
}

interface Props {
  id: number;
  data: SkillItem[] | null;
}

const SkillsForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [current, setCurrent] = useState<SkillItem>({ category: '', skill: '' });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setSkillsList(data);
    }
  }, [data]);

  const addSkill = () => {
    if (current.category.trim() && current.skill.trim()) {
      setSkillsList([...skillsList, current]);
      setCurrent({ ...current, skill: '' });
    }
  };

  const removeSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateResumeSkills(id, skillsList);
    } catch (error: any) {
      console.error('Error saving skills:', error.response?.data || error.message);
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
          onChange={(e) => setCurrent({...current, category: e.target.value})}
        />
        <div className="flex gap-2">
          <input 
            placeholder="Skill (e.g., React)" 
            className={inputClass}
            value={current.skill}
            onChange={(e) => setCurrent({...current, skill: e.target.value})}
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
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Save Skills
        </button>
      )}
    </div>
  );
};

export default SkillsForm;