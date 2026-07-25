import apiClient from './client';

export const authApi = {
  login: async (data: any) => apiClient.post('/auth/login', data),
  register: async (data: any) => apiClient.post('/auth/register', data),
  logout: async () => apiClient.post('/auth/logout'),
  changePassword: async (data: any) => apiClient.post('/auth/change-password', data),
};
