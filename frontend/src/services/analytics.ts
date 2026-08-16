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

export interface RecentActivityItem {
  id: string;
  type: 'quiz' | 'interview' | 'resume' | 'roadmap';
  title: string;
  description: string;
  timestamp?: string;
  score?: string;
  status: string;
  link: string;
}

export interface WeeklyGoals {
  quizzes_completed: number;
  quizzes_target: number;
  interviews_completed: number;
  interviews_target: number;
  tasks_completed: number;
  tasks_target: number;
  current_streak_days: number;
}

export interface RoleInsights {
  target_role: string;
  salary_range: string;
  demand_level: string;
  market_growth: string;
  top_trending_skills: string[];
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
  recent_activity: RecentActivityItem[];
  weekly_goals: WeeklyGoals;
  role_insights: RoleInsights;
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
