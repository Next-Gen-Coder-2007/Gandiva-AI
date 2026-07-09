import { api } from './api';

export interface Job {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number; // Optional
  salary_max?: number; // Optional
  description: string;
  redirect_url: string;
  created: string; // ISO Date
}

export interface Category {
  tag: string;
  label: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get(`jobs/categories`);
  return res.data;
};

export const searchJobs = async (query: string, category: string, page: number = 1) => {
  const res = await api.get(`/jobs/`, {
    params: { query, category, page }
  });
  return res.data;
};