import { api } from './api';

export const createResume = async (title: string) => {
  return await api.post("/resumes", { title });
};

export const deleteResume = async (resumeId: number) => {
  return await api.post(`/resumes/${resumeId}/delete`);
}

export const getAllResumes = async () => {
  return await api.get("/resumes");
}