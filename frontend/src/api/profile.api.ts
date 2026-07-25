import apiClient from './client';

export const profileApi = {
  getProfile: async () => apiClient.get('/users/profile'),
  updateProfile: async (data: any) => apiClient.put('/users/profile', data),
  uploadAvatar: async (data: FormData) => apiClient.post('/users/profile/avatar', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
