import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { updateResumeLanguages } from '../../services/resume';

interface Language {
  language: string;
  proficiency: string;
}

interface Props {
  id: number;
  data: Language[] | null;
  onUpdate: (data: any) => void;
}

const LanguagesForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [languagesList, setLanguagesList] = useState<Language[]>(data || []);
  const [current, setCurrent] = useState<Language>({ language: '', proficiency: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addLanguage = () => {
    if (current.language.trim() && current.proficiency.trim()) {
      const updatedList = [...languagesList, current];
      setLanguagesList(updatedList);
      onUpdate(updatedList);
      setCurrent({ language: '', proficiency: '' });
      setSaveStatus('idle');
    }
  };

  const removeLanguage = (index: number) => {
    const updatedList = languagesList.filter((_, i) => i !== index);
    setLanguagesList(updatedList);
    onUpdate(updatedList);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await updateResumeLanguages(id, languagesList);
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving languages:', error.response?.data || error.message);
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
          placeholder="Language (e.g., English)" 
          className={inputClass}
          value={current.language}
          onChange={(e) => {
            setCurrent({...current, language: e.target.value});
            if (saveStatus !== 'idle') setSaveStatus('idle');
          }}
        />
        <div className="flex gap-2">
          <input 
            placeholder="Proficiency (e.g., Native)" 
            className={inputClass}
            value={current.proficiency}
            onChange={(e) => {
              setCurrent({...current, proficiency: e.target.value});
              if (saveStatus !== 'idle') setSaveStatus('idle');
            }}
            onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
          />
          <button 
            onClick={addLanguage}
            className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

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
            {isSaving ? 'Saving Languages...' : 'Save All Languages'}
          </button>

          {saveStatus === 'success' && (
            <p className="text-green-500 text-sm text-center font-medium animate-pulse">
              Languages saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-sm text-center font-medium">
              Failed to save languages. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguagesForm;