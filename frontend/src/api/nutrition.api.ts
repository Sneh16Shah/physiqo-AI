import apiClient from './client';

export const nutritionApi = {
  getFoods: async (params?: any) => apiClient.get('/nutrition/foods', { params }),
  createCustomFood: async (data: any) => apiClient.post('/nutrition/foods', data),
  getMeals: async (date?: string) => apiClient.get('/nutrition/meals', { params: { date } }),
  createMeal: async (data: any) => apiClient.post('/nutrition/meals', data),
  updateMeal: async (id: string, data: any) => apiClient.put(`/nutrition/meals/${id}`, data),
  deleteMeal: async (id: string) => apiClient.delete(`/nutrition/meals/${id}`),
  getDailySummary: async (date?: string) => apiClient.get('/nutrition/summary', { params: { date } }),
  getCurrentGoal: async () => apiClient.get('/nutrition/goals/current'),
  setGoal: async (data: any) => apiClient.post('/nutrition/goals', data),
};
