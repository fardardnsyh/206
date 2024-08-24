import axios from './axios';
import { Auth } from '../types/Auth';

export async function loginUser(email: string, password: string) {
  const res = await axios.post<Auth>('/auth/login', { email, password });
  return res.data;
}

export async function logoutUser() {
  const res = await axios.get('/auth/logout');
  return res;
}

export async function refreshAccessToken() {
  const res = await axios.get<{ accessToken: string }>('/auth/refresh');
  return res.data.accessToken;
}

