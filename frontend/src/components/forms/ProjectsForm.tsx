import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

const ProjectsForm: React.FC = () => {
  const { isDark } = useTheme();
  
  // State for the list of projects
  const [projects, setProjects] = useState<any[]>([]);
  // State for the active form fields
  const [formData, setFormData] = useState({
    title: '', tech_stack: '', github: '', live_demo: '', description: ''
  });

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark 
      ? 'bg-black border-zinc-800 text-white focus:border-green-500' 
      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  const addProject = () => {
    if (formData.title) {
      setProjects([...projects, formData]);
      setFormData({ title: '', tech_stack: '', github: '', live_demo: '', description: '' });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Project Details</h3>
      
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Project Title</label>
          <input className={inputClass} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Project Title" />
        </div>
        <div>
          <label className={labelClass}>Tech Stack</label>
          <input className={inputClass} value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} placeholder="e.g., React, FastAPI" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className={inputClass} value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="GitHub URL" />
          <input className={inputClass} value={formData.live_demo} onChange={(e) => setFormData({...formData, live_demo: e.target.value})} placeholder="Live Demo URL" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={`${inputClass} h-24`} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Project description..." />
        </div>
        <button onClick={addProject} className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Dynamic List */}
      <div className="space-y-3 mt-4">
        {projects.map((item, index) => (
          <div key={index} className={`p-4 rounded-xl border flex justify-between items-start ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-sm opacity-70">{item.tech_stack}</p>
            </div>
            <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {projects.length > 0 && (
        <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Save All Projects
        </button>
      )}
    </div>
  );
};

export default ProjectsForm;