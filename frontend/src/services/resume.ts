import { api } from './api';

export const createResume = async (title: string) => {
  return await api.post("/resumes", { title });
};

export const uploadResume = async (title: string, file: File) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  return await api.post("/resumes/upload", formData);
}

export const deleteResume = async (resumeId: number) => {
  return await api.delete(`/resumes/${resumeId}`);
}

export const getAllResumes = async () => {
  return await api.get("/resumes");
}

export const getResumeById = async (resumeId: number) => {
  return await api.get(`/resumes/${resumeId}`);
}

export const updateResumePersonalInfo = async (resumeId: number, personalInfo: any) => {
  return await api.put(`/resumes/${resumeId}/personal-info`, personalInfo);
}

export const updateResumeSkills = async (resumeId: number, skills: any) => {
  return await api.put(`/resumes/${resumeId}/skills`, skills);
}

export const updateResumeProjects = async (resumeId: number, projects: any) => {
  return await api.put(`/resumes/${resumeId}/projects`, projects);
}

export const updateResumeEducations = async (resumeId: number, educations: any) => {
  return await api.put(`/resumes/${resumeId}/educations`, educations);
}

export const updateResumeExperiences = async (resumeId: number, experiences: any) => {
  return await api.put(`/resumes/${resumeId}/experiences`, experiences);
}

export const updateResumeLanguages = async (resumeId: number, languages: any) => {
  return await api.put(`/resumes/${resumeId}/languages`, languages);
}

export const updateResumeCertificates = async (resumeId: number, certificates: any) => {
  return await api.put(`/resumes/${resumeId}/certificates`, certificates);
}

export const updateResumeAchievements = async (resumeId: number, achievements: any) => {
  return await api.put(`/resumes/${resumeId}/achievements`, achievements);
}

export const updateResumeTheme = async (resumeId: number, theme: any, themeColor: any) => {
  return await api.post(`/resumes/${resumeId}/theme`, {
    theme, themeColor
  })
}

