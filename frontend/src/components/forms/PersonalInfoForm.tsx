import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const PersonalInfoForm: React.FC = () => {
  const { isDark } = useTheme();

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  const handleSave = () => {
    console.log("Saving all personal info fields to Resume model...");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" placeholder="Full Name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" placeholder="Email address" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" placeholder="Phone number" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input type="text" placeholder="City, Country" className={inputClass} />
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className={labelClass}>Profile Summary</label>
        <textarea 
          placeholder="A brief professional summary..." 
          className={`${inputClass} h-32 resize-none`} 
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>LinkedIn URL</label>
          <input type="url" placeholder="linkedin.com/in/..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>GitHub URL</label>
          <input type="url" placeholder="github.com/..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Portfolio URL</label>
          <input type="url" placeholder="yourportfolio.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Personal Website</label>
          <input type="url" placeholder="yourwebsite.com" className={inputClass} />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
      >
        Save Personal Info
      </button>
    </div>
  );
};

export default PersonalInfoForm;