import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';
import { updateResumeProjects } from '../../services/resume';

interface Project {
  title: string;
  tech_stack: string;
  github: string;
  live_demo: string;
  description: string;
}

interface Props {
  id: number;
  data: Project[] | null;
}

const ProjectsForm: React.FC<Props> = ({ id, data }) => {
  const { isDark } = useTheme();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<Project>({
    title: '', tech_stack: '', github: '', live_demo: '', description: ''
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setProjects(data);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addProject = () => {
    if (formData.title.trim()) {
      setProjects([...projects, formData]);
      setFormData({ title: '', tech_stack: '', github: '', live_demo: '', description: '' });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try{
      await updateResumeProjects(id, formData);
    } catch (error: any) {
      console.error('Error saving projects:', error.response?.data || error.message);
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
          <label className={labelClass}>Project Title</label>
          <input name="title" className={inputClass} value={formData.title} onChange={handleChange} placeholder="e.g., E-commerce Platform" />
        </div>
        <div>
          <label className={labelClass}>Tech Stack</label>
          <input name="tech_stack" className={inputClass} value={formData.tech_stack} onChange={handleChange} placeholder="e.g., React, FastAPI, PostgreSQL" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="github" className={inputClass} value={formData.github} onChange={handleChange} placeholder="GitHub URL" />
          <input name="live_demo" className={inputClass} value={formData.live_demo} onChange={handleChange} placeholder="Live Demo URL" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" className={`${inputClass} h-24`} value={formData.description} onChange={handleChange} placeholder="What did you build? How did you build it?" />
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
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
        >
          Save All Projects
        </button>
      )}
    </div>
  );
};

export default ProjectsForm;