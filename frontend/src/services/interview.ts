import { api } from './api';

export interface InterviewCreatePayload {
  role: string;
  experience: string;
  difficulty: string;
  interview_type: string;
  num_questions: number;
  company?: string;
  skills?: string;
}

export interface DetailedQAFeedback {
  question: string;
  user_answer: string;
  feedback: string;
  code_snippet?: string;
  model_ideal_answer?: string;
}

export interface InterviewEvaluation {
  id?: number;
  overall_score: number;
  technical_score?: number;
  communication_score?: number;
  problem_solving_score?: number;
  recommendation?: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice';
  strengths: string[];
  areas_of_improvement: string[];
  actionable_remediation?: string[];
  detailed_feedback: any[];
}

export interface InterviewMessage {
  id: number;
  role: 'ai' | 'user';
  content: string;
  created_at?: string;
}

export interface InterviewSessionData {
  id: number;
  role: string;
  company?: string;
  difficulty: string;
  interview_type: string;
  status: 'in_progress' | 'completed';
  current_question_index: number;
  num_questions: number;
  created_at?: string;
  completed_at?: string;
  chat_history: InterviewMessage[];
  evaluation?: InterviewEvaluation;
}

export const getInterviews = async () => {
  const response = await api.get('/interviews');
  return response.data;
};

export const getInterviewDetails = async (id: string | number): Promise<InterviewSessionData> => {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
};

export const createInterview = async (data: InterviewCreatePayload) => {
  const response = await api.post('/interviews', data);
  return response;
};

export const deleteInterview = async (id: number) => {
  const response = await api.delete(`/interviews/${id}`);
  return response.data;
};

export const submitAnswer = async (
  id: string | number, 
  payload: { text: string; code_snippet?: string; language?: string }
): Promise<InterviewSessionData> => {
  const response = await api.post(`/interviews/${id}/answers`, payload);
  return response.data;
};

export const getInterviewHint = async (
  id: string | number,
  user_query?: string
): Promise<{ hint: string }> => {
  const response = await api.post(`/interviews/${id}/hint`, { user_query });
  return response.data;
};

export const completeInterview = async (id: string | number): Promise<InterviewSessionData> => {
  const response = await api.post(`/interviews/${id}/complete`);
  return response.data;
};