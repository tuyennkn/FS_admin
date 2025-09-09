import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from '../utils/tokenUtils';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
});


api.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        const res = await axios.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  const data = res.data as { accessToken: string };
  setAccessToken(data.accessToken);
  originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // handle logout
      }
    }
    return Promise.reject(error);
  }
);


export const apiService = {
  get: <T = any>(url: string, config?: any) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => api.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) => api.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => api.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: any) => api.patch<T>(url, data, config),
  request: <T = any>(config: any) => api.request<T>(config),
};
