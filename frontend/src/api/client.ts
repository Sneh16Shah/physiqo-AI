import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../stores/toastStore';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (refreshToken && refreshToken !== 'undefined') {
        originalRequest._retry = true;
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const newToken = data.accessToken || data.token;
          if (newToken) {
            useAuthStore.getState().setAuth(
              newToken,
              data.user || useAuthStore.getState().user || { id: data.id, email: data.email, name: 'User' },
              data.refreshToken || refreshToken
            );
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          useAuthStore.getState().logout();
          toast.error('Your session has expired. Please log in again.', 'Session Expired');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please sign in.', 'Unauthorized');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
