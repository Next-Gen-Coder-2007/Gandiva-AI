import { api } from './api';

export interface QuizData {
  title?: string;
  difficulty?: string;
  no_of_questions?: number;
}

export const createQuiz = async (quizData: QuizData) => {
  return await api.post('/quizzes', quizData);
};

export const deleteQuiz = async (quizId: string | number) => {
  return await api.delete(`/quizzes/${quizId}`);
};

export const getAllQuizzes = async () => {
  return await api.get('/quizzes');
};

export const getQuizById = async (quizId: string | number) => {
  return await api.get(`/quizzes/${quizId}`);
};

export const submitQuizAttempt = async (quizId: string | number, payload: any) => {
  return await api.post(`/quizzes/${quizId}/attempts`, payload);
};


export const getAttemptDetails = async (quizId: string | number, attemptId: string | number) => {
  return await api.get(`/quizzes/${quizId}/attempts/${attemptId}`);
};