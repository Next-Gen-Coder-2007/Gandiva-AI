import { api } from './api';

export const createQuiz = async (quizData: { title?: string; difficulty?: string, no_of_question?: Number }) => {
    return await api.post('/quizzes', quizData);
}

export const deleteQuiz = async (quizId: number) => {
  return await api.delete(`/quizes/${quizId}`);
}

export const getAllQuizzes = async () => {
  return await api.get("/quizzes");
}

export const getQuizById = async (quizId: number) => {
  return await api.get(`/quizzes/${quizId}`);
}