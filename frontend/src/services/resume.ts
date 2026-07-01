import { api } from './api';

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post("/resume/upload", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};