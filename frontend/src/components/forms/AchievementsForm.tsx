import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
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

  const addAchievement = () => {
    if (current.title.trim()) {
      const updatedList = [...achievements, current];      
      setAchievements(updatedList);      
      onUpdate(updatedList);      
      setCurrent({ title: '', description: '' });
    }
  };

  const removeAchievement = (index: number) => {
    const updatedList = achievements.filter((_, i) => i !== index);
    setAchievements(updatedList);    
    onUpdate(updatedList);
  };

  const handleSave = async () => {
    try {
      await updateResumeAchievements(id, achievements);
    } catch(err: any) {
      console.log("Error updating Achievements", err.response?.detail);
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
            onChange={(e) => setCurrent({...current, title: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea 
            placeholder="Describe your achievement..." 
            className={`${inputClass} h-24 resize-none`}
            value={current.description}
            onChange={(e) => setCurrent({...current, description: e.target.value})}
          />
        </div>
        <button 
          onClick={addAchievement}
          className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
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
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Save All Achievements
        </button>
      )}
    </div>
  );
};

export default AchievementsForm;