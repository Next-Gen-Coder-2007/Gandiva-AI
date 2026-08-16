import { api } from "./api";

export interface AnalyzeResumeRequest {
  target_job_title?: string;
  job_description?: string;
}

export interface SectionFeedback {
  section_name: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  missing_information: string[];
  suggestions: string[];
}

export interface PrioritizedSuggestion {
  priority: string;
  category: string;
  actionable_advice: string;
}

export interface ResumeAnalysisResponse {
  id: number;
  resume_id: number;
  target_job_title: string | null;
  job_description: string | null;

  overall_score: number | null;
  ats_score: number | null;
  keyword_score: number | null;
  skills_score: number | null;
  experience_score: number | null;
  projects_score: number | null;
  education_score: number | null;

  analysis_result: SectionFeedback[] | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  matching_skills: string[] | null;
  missing_skills: string[] | null;
  matching_keywords: string[] | null;
  missing_keywords: string[] | null;
  suggestions: PrioritizedSuggestion[] | null;

  created_at: string;
  updated_at: string | null;
}

export const createResume = async (title: string) => {
  return await api.post("/resumes", { title });
};

export const uploadResume = async (title: string, file: File) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  return await api.post("/resumes/upload", formData);
};

export const deleteResume = async (resumeId: number) => {
  return await api.delete(`/resumes/${resumeId}`);
};

export const getAllResumes = async () => {
  return await api.get("/resumes");
};

export const getResumeById = async (resumeId: number) => {
  return await api.get(`/resumes/${resumeId}`);
};

export const updateResumePersonalInfo = async (
  resumeId: number,
  personalInfo: any,
) => {
  return await api.put(`/resumes/${resumeId}/personal-info`, personalInfo);
};

export const updateResumeSkills = async (resumeId: number, skills: any) => {
  return await api.put(`/resumes/${resumeId}/skills`, skills);
};

export const updateResumeProjects = async (resumeId: number, projects: any) => {
  return await api.put(`/resumes/${resumeId}/projects`, projects);
};

export const updateResumeEducations = async (
  resumeId: number,
  educations: any,
) => {
  return await api.put(`/resumes/${resumeId}/educations`, educations);
};

export const updateResumeExperiences = async (
  resumeId: number,
  experiences: any,
) => {
  return await api.put(`/resumes/${resumeId}/experiences`, experiences);
};

export const updateResumeLanguages = async (
  resumeId: number,
  languages: any,
) => {
  return await api.put(`/resumes/${resumeId}/languages`, languages);
};

export const updateResumeCertificates = async (
  resumeId: number,
  certificates: any,
) => {
  return await api.put(`/resumes/${resumeId}/certificates`, certificates);
};

export const updateResumeAchievements = async (
  resumeId: number,
  achievements: any,
) => {
  return await api.put(`/resumes/${resumeId}/achievements`, achievements);
};

export const updateResumeTheme = async (
  resumeId: number,
  themeData: { theme?: string; color?: string },
) => {
  return await api.put(`/resumes/${resumeId}/theme`, themeData);
};

export const analyzeResume = async (
  resumeId: number,
  data: AnalyzeResumeRequest,
) => {
  return await api.post(`/resumes/${resumeId}/analyze`, data);
};

export const getResumeAnalysis = async (
  resumeId: number,
) => {
  return await api.get(`/resumes/${resumeId}/analysis`);
};

export interface EnhanceTextPayload {
  text: string;
  section_type?: 'bullet' | 'summary' | 'project';
  role?: string;
}

export interface EnhancedTextResult {
  original_text: string;
  enhanced_text: string;
  improvement_notes?: string;
}

export const enhanceResumeText = async (payload: EnhanceTextPayload): Promise<EnhancedTextResult> => {
  const response = await api.post('/resumes/enhance-text', payload);
  return response.data;
};
