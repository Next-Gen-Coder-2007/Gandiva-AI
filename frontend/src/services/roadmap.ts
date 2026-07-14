import { api } from './api';

export interface RoadmapTask {
  id: number;
  phase_id: number;
  title: string;
  description?: string;
  resource_links?: string;
  practical_exercise?: string;
  interview_tips?: string;
  is_completed: boolean;
}

export interface RoadmapPhase {
  id: number;
  roadmap_id: number;
  title: string;
  description?: string;
  estimated_duration?: string;
  phase_order: number;
  is_completed: boolean;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  id: number;
  user_id: number;
  target_role: string;
  current_status?: string;
  created_at: string;
  phases: RoadmapPhase[];
}

export const generateRoadmap = async (targetRole: string) => {
  return await api.post('/roadmaps', { target_role: targetRole });
};

export const getAllRoadmaps = async () => {
  return await api.get('/roadmaps');
};

export const getRoadmapById = async (roadmapId: string | number) => {
  return await api.get(`/roadmaps/${roadmapId}`);
};

export const updateTaskStatus = async (taskId: number, isCompleted: boolean) => {
  return await api.patch(`/roadmaps/tasks/${taskId}`, { is_completed: isCompleted });
};

export const deleteRoadmap = async (roadmapId: string | number) => {
  return await api.delete(`/roadmaps/${roadmapId}`);
};