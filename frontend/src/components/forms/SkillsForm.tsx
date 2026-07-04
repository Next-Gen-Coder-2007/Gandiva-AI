import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

const SkillsForm: React.FC = () => {
  const { isDark } = useTheme();
  
  // Local state to manage the list of skills being added
  const [skillsList, setSkillsList] = useState<{ category: string; skill: string }[]>([]);
  const [category, setCategory] = useState('');
  const [skill, setSkill] = useState('');

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const addSkill = () => {
    if (category && skill) {
      setSkillsList([...skillsList, { category, skill }]);
      setSkill(''); // Clear skill input after adding
    }
  };

  const removeSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("Saving skills to database:", skillsList);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Skills</h3>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          placeholder="Category (e.g., Frontend)" 
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="flex gap-2">
          <input 
            placeholder="Skill (e.g., React)" 
            className={inputClass}
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
          />
          <button 
            onClick={addSkill}
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List Display */}
      <div className="space-y-2">
        {skillsList.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
          >
            <span className="font-medium">
              <span className="text-green-500 mr-2">[{item.category}]</span> 
              {item.skill}
            </span>
            <button onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
      >
        Save Skills
      </button>
    </div>
  );
};

export default SkillsForm;