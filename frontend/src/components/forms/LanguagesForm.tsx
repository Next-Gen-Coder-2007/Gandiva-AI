import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

const LanguagesForm: React.FC = () => {
  const { isDark } = useTheme();
  
  // Local state for the list and current input
  const [languagesList, setLanguagesList] = useState<{ language: string; proficiency: string }[]>([]);
  const [current, setCurrent] = useState({ language: '', proficiency: '' });

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const addLanguage = () => {
    if (current.language && current.proficiency) {
      setLanguagesList([...languagesList, current]);
      setCurrent({ language: '', proficiency: '' });
    }
  };

  const removeLanguage = (index: number) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("Saving all languages to database:", languagesList);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Languages</h3>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          placeholder="Language (e.g., English)" 
          className={inputClass}
          value={current.language}
          onChange={(e) => setCurrent({...current, language: e.target.value})}
        />
        <div className="flex gap-2">
          <input 
            placeholder="Proficiency (e.g., Native)" 
            className={inputClass}
            value={current.proficiency}
            onChange={(e) => setCurrent({...current, proficiency: e.target.value})}
          />
          <button 
            onClick={addLanguage}
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List Display */}
      <div className="space-y-2">
        {languagesList.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
          >
            <span className="font-medium">
              {item.language} <span className="text-zinc-500 text-sm ml-2">({item.proficiency})</span>
            </span>
            <button onClick={() => removeLanguage(index)} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {languagesList.length > 0 && (
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Save All Languages
        </button>
      )}
    </div>
  );
};

export default LanguagesForm;