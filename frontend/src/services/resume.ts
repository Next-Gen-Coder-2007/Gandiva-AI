import { api } from './api';

export const createResume = async (name: string) => {
  return await api.post("/resumes", { name });
};

export const getAllResumes = async () => {
  return await api.get("/resumes");
}