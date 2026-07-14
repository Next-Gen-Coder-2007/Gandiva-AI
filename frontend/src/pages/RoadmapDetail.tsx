import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getRoadmapById, updateTaskStatus, type Roadmap } from '../services/roadmap';
import { ArrowLeft, Loader2, CheckCircle, Circle, ChevronDown, ChevronUp, Link as LinkIcon, Clock } from 'lucide-react';

const RoadmapDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<number[]>([]);

  useEffect(() => {
    if (id) fetchRoadmapData();
  }, [id]);

  const fetchRoadmapData = async () => {
    try {
      const response = await getRoadmapById(id as string);
      setRoadmap(response.data);
      if (response.data.phases?.length > 0) {
        setExpandedPhases([response.data.phases[0].id]);
      }
    } catch (err) {
      console.error("Failed to load roadmap details", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const handleTaskToggle = async (taskId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (!roadmap) return;

    const updatedRoadmap = { ...roadmap };
    updatedRoadmap.phases = updatedRoadmap.phases.map(phase => {
      const taskIndex = phase.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        phase.tasks[taskIndex].is_completed = newStatus;
        phase.is_completed = phase.tasks.every(t => t.is_completed);
      }
      return phase;
    });
    setRoadmap(updatedRoadmap);

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to update task", err);
      fetchRoadmapData(); 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="p-8 text-center text-red-500">
        Roadmap not found.
      </div>
    );
  }

  const totalTasks = roadmap.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.is_completed).length, 0);
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <button 
          onClick={() => navigate('/roadmaps')}
          className={`flex items-center gap-2 mb-4 text-sm font-semibold transition-colors hover:text-green-500 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
        </button>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{roadmap.target_role}</h1>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {roadmap.current_status || "AI-generated curriculum based on your profile."}
        </p>
      </div>

      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="flex justify-between items-end mb-3">
          <span className="font-bold text-sm uppercase tracking-wider text-green-500">Curriculum Progress</span>
          <span className="font-extrabold text-2xl">{progressPercent}%</span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
          <div 
            className="h-full bg-green-500 transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className={`mt-3 text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:inset-y-0 before:left-[27px] sm:before:left-[43px] before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
        {roadmap.phases.map((phase, index) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const allTasksDone = phase.tasks.length > 0 && phase.tasks.every(t => t.is_completed);

          return (
            <div key={phase.id} className="relative">
              <div className={`absolute -left-10 sm:-left-12 mt-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 ${
                isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'
              } ${allTasksDone ? '!border-green-500 bg-green-500/10' : ''}`}>
                {allTasksDone && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>

              <div className={`rounded-2xl border transition-all ${
                isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <button 
                  onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-green-500">
                        Phase {index + 1}
                      </span>
                      {phase.estimated_duration && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 rounded-md ${
                          isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          <Clock className="w-3 h-3" /> {phase.estimated_duration}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold ${allTasksDone && isDark ? 'text-zinc-400' : ''}`}>
                      {phase.title}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-full ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className={`px-5 sm:px-6 pb-6 border-t pt-4 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    {phase.description && (
                      <p className={`mb-6 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {phase.description}
                      </p>
                    )}

                    <div className="space-y-4">
                      {phase.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`flex items-start gap-4 p-5 rounded-xl border transition-colors ${
                            task.is_completed 
                              ? isDark ? 'border-green-500/30 bg-green-500/5' : 'border-green-200 bg-green-50'
                              : isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'
                          }`}
                        >
                          <button 
                            onClick={() => handleTaskToggle(task.id, task.is_completed)}
                            className="mt-0.5 shrink-0"
                          >
                            {task.is_completed ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className={`w-6 h-6 ${isDark ? 'text-zinc-600 hover:text-green-500' : 'text-zinc-300 hover:text-green-500'} transition-colors`} />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <h4 className={`font-semibold text-base ${task.is_completed ? (isDark ? 'text-zinc-400 line-through' : 'text-zinc-500 line-through') : ''}`}>
                              {task.title}
                            </h4>
                            
                            {task.description && (
                              <p className={`mt-1.5 text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {task.description}
                              </p>
                            )}
                            
                            <div className={`mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 transition-opacity ${task.is_completed ? 'opacity-50' : 'opacity-100'}`}>
                              {task.practical_exercise && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-zinc-800/80' : 'bg-zinc-50/50 border-zinc-200'}`}>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1.5">
                                    Practical Exercise
                                  </span>
                                  <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {task.practical_exercise}
                                  </p>
                                </div>
                              )}

                              {task.interview_tips && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-zinc-800/80' : 'bg-zinc-50/50 border-zinc-200'}`}>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-2 flex items-center gap-1.5">
                                    Interview Prep
                                  </span>
                                  <p className={`text-xs leading-relaxed font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {task.interview_tips}
                                  </p>
                                </div>
                              )}
                            </div>

                            {task.resource_links && (
                              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400">
                                <LinkIcon className="w-3 h-3" />
                                <a href={task.resource_links} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {task.resource_links}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapDetail;