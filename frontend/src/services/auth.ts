import { api } from './api';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  target_role?: string;
  college?: string;
  branch?: string;
  cgpa?: number;
  year?: string;
  bio?: string;
  avatar_url?: string;
  interview_tone_preference?: string;
}

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put("/auth/profile", profileData);
  return response.data;
};

export const verifyGoogleToken = async (accessToken: string) => {
  const response = await api.post("/google/verify", { access_token: accessToken });
  return response.data;
};