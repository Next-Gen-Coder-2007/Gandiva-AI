import { api } from './api';

export const createResume = async (name: string) => {
  return await api.post("/resumes", { name });
};