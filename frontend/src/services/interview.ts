import { api } from './api';

const API_URL = '/interviews'; // Adjust base URL if needed

export interface InterviewCreateData {
  role: string;
  experience?: string;
  difficulty?: string;
  interview_type?: string;
  duration?: number;
  num_questions?: number;
  skills?: string;
  company?: string;
}

export const createInterview = async (data: InterviewCreateData) => {
  return api.post(`${API_URL}/create`, data);
};

export const getInterviews = async () => {
  return api.get(API_URL);
};

export const getInterview = async (id: number) => {
  return api.get(`${API_URL}/${id}`);
};

export const startInterview = async (id: number) => {
  return api.post(`${API_URL}/${id}/start`);
};

export const submitAnswer = async (questionId: number, answerText: string, timeTaken: number = 0) => {
  return api.post(`${API_URL}/question/${questionId}/answer`, {
    answer_text: answerText,
    time_taken: timeTaken
  });
};

export const evaluateInterview = async (id: number) => {
  return api.post(`${API_URL}/${id}/evaluate`);
};

export const deleteInterview = async (id: number) => {
  return api.delete(`${API_URL}/${id}`);
};

export const retakeInterview = async (id: number) => {
  return api.post(`${API_URL}/${id}/retake`);
};