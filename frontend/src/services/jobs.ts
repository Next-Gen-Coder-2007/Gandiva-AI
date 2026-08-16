import { api } from './api';

export interface Job {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  salary_period?: 'month' | 'year';
  description: string;
  work_mode?: 'Remote' | 'Hybrid' | 'On-site';
  experience_level?: 'Internship' | 'Entry Level' | 'Mid Level' | 'Senior';
  skills?: string[];
  redirect_url: string;
  created: string;
  category?: { tag: string; label: string };
}

export interface Category {
  tag: string;
  label: string;
  count?: number;
}

export interface JobSearchResponse {
  results: Job[];
  total: number;
  page: number;
  total_pages: number;
}

export interface JobSearchParams {
  query?: string;
  category?: string;
  location?: string;
  work_mode?: string;
  experience_level?: string;
  page?: number;
  limit?: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get(`/jobs/categories`);
  return res.data;
};

export const searchJobs = async (params: JobSearchParams = {}): Promise<JobSearchResponse> => {
  const res = await api.get(`/jobs/`, {
    params: {
      query: params.query || '',
      category: params.category || '',
      location: params.location || 'India',
      work_mode: params.work_mode || 'All',
      experience_level: params.experience_level || 'All',
      page: params.page || 1,
      limit: params.limit || 12
    }
  });
  return res.data;
};