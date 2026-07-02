import { api } from './api';

export const sendOtp = async (email: string) => {
  const response = await api.post("/auth/forgot-password", { 
    email 
  });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post("/auth/verify-otp", { 
    email,
    otp
  });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await api.post("/auth/reset-password", { 
    email,
    otp, 
    new_password: newPassword 
  });
  return response.data;
};

export const changePassword = async (newPassword: string) => {
  const response = await api.post("/auth/change-password", { 
    new_password: newPassword 
  });
  return response.data;
}