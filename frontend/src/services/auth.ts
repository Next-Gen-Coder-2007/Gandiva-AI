import axios from "axios";

const API = "http://127.0.0.1:8000";

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const response = await axios.post(`${API}/auth/register`, {
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
  const response = await axios.post(`${API}/auth/login`, {
    email,
    password,
  });

  return response.data;
};