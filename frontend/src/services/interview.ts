import { api } from './api'; // Replace with your actual configured Axios instance

export interface InterviewCreatePayload {
  role: string;
  experience: string;
  difficulty: string;
  interview_type: string;
  num_questions: number;
  company?: string;
  skills?: string;
}

export const getInterviews = async () => {
  const response = await api.get('/interviews');
  return response.data;
};

export const getInterviewDetails = async (id: string | number) => {
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

export const submitAnswer = async (id: string | number, text: string) => {
  const response = await api.post(`/interviews/${id}/answers`, { text });
  return response.data;
};

export const completeInterview = async (id: string | number) => {
  const response = await api.post(`/interviews/${id}/complete`);
  return response.data;
};