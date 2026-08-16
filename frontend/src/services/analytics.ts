import { api } from './api';

export interface DashboardMetric {
  label: string;
  value: string;
  numeric_value: number;
  icon_type: string;
  status: 'positive' | 'warning' | 'neutral';
  detail?: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  link: string;
  button_text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MatchedInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match_percentage: number;
  redirect_url: string;
}

export interface DashboardData {
  placement_readiness_score: number;
  score_breakdown: {
    resume_ats: number;
    quiz_score: number;
    interview_score: number;
    project_score: number;
    skill_score: number;
  };
  metrics: DashboardMetric[];
  weak_skills: string[];
  matched_skills: string[];
  recommended_actions: RecommendedAction[];
  recommended_internships: MatchedInternship[];
  summary: {
    total_resumes: number;
    total_quizzes: number;
    total_quiz_attempts: number;
    total_interviews: number;
    completed_interviews: number;
    total_roadmaps: number;
    total_roadmap_tasks: number;
    completed_roadmap_tasks: number;
  };
}

export const getDashboardAnalytics = async (): Promise<DashboardData> => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};
