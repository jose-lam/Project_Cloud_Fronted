import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

const axiosClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
