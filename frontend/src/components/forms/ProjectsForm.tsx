import React, { useState } from 'react';
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
  onUpdate: (data: any) => void;
}

const ProjectsForm: React.FC<Props> = ({ id, data, onUpdate }) => {
  const { isDark } = useTheme();
  
  const [projects, setProjects] = useState<Project[]>(data || []);
  const [current, setCurrent] = useState<Project>({
    title: '', tech_stack: '', github: '', live_demo: '', description: ''
  });


  const addProject = () => {
    if (current.title.trim()) {
      const updatedList = [...projects, current];
      setProjects(updatedList);
      onUpdate(updatedList);
      setCurrent({ title: '', tech_stack: '', github: '', live_demo: '', description: '' });
    }
  };

  const removeProject = (index: number) => {
    const updatedList = projects.filter((_, i) => i !== index)
    setProjects(updatedList);
    onUpdate(updatedList);
  };

  const handleSave = async () => {
    try {
      await updateResumeProjects(id, projects);
    } catch (error: any) {
      console.error('Error saving projects:', error.response?.data || error.message);
    }
  };

  const inputClass = `w-full p-3 rounded-xl border outline-none transition-colors ${
    isDark ? 'bg-black border-zinc-800 text-white focus:border-green-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-green-500'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Project Title</label>
          <input className={inputClass} value={current.title} onChange={(e) => setCurrent({...current, title: e.target.value})} placeholder="e.g., E-commerce Platform" />
        </div>
        <div>
          <label className={labelClass}>Tech Stack</label>
          <input className={inputClass} value={current.tech_stack} onChange={(e) => setCurrent({...current, tech_stack: e.target.value})} placeholder="e.g., React, FastAPI, PostgreSQL" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className={inputClass} value={current.github} onChange={(e) => setCurrent({...current, github: e.target.value})} placeholder="GitHub URL" />
          <input className={inputClass} value={current.live_demo} onChange={(e) => setCurrent({...current, live_demo: e.target.value})} placeholder="Live Demo URL" />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={`${inputClass} h-24`} value={current.description} onChange={(e) => setCurrent({...current, description: e.target.value})} placeholder="What did you build? How did you build it?" />
        </div>
        <button onClick={addProject} className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

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