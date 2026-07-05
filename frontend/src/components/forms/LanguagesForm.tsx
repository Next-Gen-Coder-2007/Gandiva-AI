import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
import { updateResumeLanguages } from '../../services/resume';

interface Language {
  language: string;
  proficiency: string;
}

interface Props {
  id: number;
  data: Language[] | null;
}

const LanguagesForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [languagesList, setLanguagesList] = useState<Language[]>([]);
  const [formData, setFormData] = useState<Language>({ language: '', proficiency: '' });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setLanguagesList(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {
    if (formData.language.trim() && formData.proficiency.trim()) {
      setLanguagesList([...languagesList, formData]);
      setFormData({ language: '', proficiency: '' });
    }
  };

  const removeLanguage = (index: number) => {
    setLanguagesList(languagesList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateResumeLanguages(id, formData);
    } catch (error: any) {
      console.error('Error saving languages:', error.response?.data || error.message);
    }
  };

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  return (
    <div className="space-y-6">

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          name="language"
          placeholder="Language (e.g., English)" 
          className={inputClass}
          value={formData.language}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <input 
            name="proficiency"
            placeholder="Proficiency (e.g., Native)" 
            className={inputClass}
            value={formData.proficiency}
            onChange={handleChange}
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
            className={`flex items-center justify-between p-3 rounded-xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className="font-medium">
              {item.language} <span className="text-zinc-500 text-sm ml-2">({item.proficiency})</span>
            </span>
            <button 
              onClick={() => removeLanguage(index)} 
              className="text-red-500 hover:text-red-600 p-1"
            >
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