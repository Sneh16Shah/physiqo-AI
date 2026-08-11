import apiClient from './client';

export const nutritionApi = {
  getFoods: async (params?: any) => apiClient.get('/foods', { params }),
  createCustomFood: async (data: any) => apiClient.post('/foods', data),
  getMeals: async (date?: string) => apiClient.get('/meals', { params: { date } }),
  createMeal: async (data: any) => apiClient.post('/meals', data),
  updateMeal: async (id: string, data: any) => apiClient.put(`/meals/${id}`, data),
  deleteMeal: async (id: string) => apiClient.delete(`/meals/${id}`),
  getDailySummary: async (date?: string) => apiClient.get('/meals/daily-summary', { params: { date } }),
  getCurrentGoal: async () => apiClient.get('/nutrition-goals/current'),
  setGoal: async (data: any) => apiClient.post('/nutrition-goals', data),
};
