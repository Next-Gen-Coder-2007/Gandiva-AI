import { api } from './api';

export const createResume = async (name: string) => {
  return await api.post("/resumes", { name });
};

export const deleteResume = async (resumeId: number) => {
  return await api.post(`/resumes/${resumeId}/delete`);
}

export const getAllResumes = async () => {
  return await api.get("/resumes");
}