import axios from 'axios';
import { API_BASE_URL } from './config';

// set to true if using local dev API server
const USE_LOCAL_API = false;

const axiosAuth = axios.create({
  baseURL: USE_LOCAL_API ? '' : API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors for debug logging
axiosAuth.interceptors.request.use((req) => {
  console.log('Requesting:', req);
  return req;
});

axiosAuth.interceptors.response.use(
  (res) => {
    console.log('Response:', res);
    return res;
  },
  (err) => {
    console.error('Response error:', err);
    return Promise.reject(err);
  }
);

export default axiosAuth;

