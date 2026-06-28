import { api } from './api';

export const sendContactMessage = async (
  name: string,
  email: string,
  message: string
) => {
  const response = await api.post("/contact", {
    name,
    email,
    message,
  });
  return response.data;
};