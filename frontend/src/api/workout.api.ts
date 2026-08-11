import apiClient from './client';

export const workoutApi = {
  getMuscles: async () => apiClient.get('/muscles'),
  getExercises: async (params?: any) => apiClient.get('/exercises', { params }),
  getExerciseById: async (id: string) => apiClient.get(`/exercises/${id}`),
  createCustomExercise: async (data: any) => apiClient.post('/exercises', data),
  getWorkoutPlans: async () => apiClient.get('/workout-plans'),
  getWorkoutPlanById: async (id: string) => apiClient.get(`/workout-plans/${id}`),
  createWorkoutPlan: async (data: any) => apiClient.post('/workout-plans', data),
  updateWorkoutPlan: async (id: string, data: any) => apiClient.put(`/workout-plans/${id}`, data),
  deleteWorkoutPlan: async (id: string) => apiClient.delete(`/workout-plans/${id}`),
  startWorkoutSession: async (data: any) => apiClient.post('/workout-sessions', data),
  updateWorkoutSession: async (id: string, data: any) => apiClient.put(`/workout-sessions/${id}`, data),
  logExerciseSet: async (sessionId: string, data: any) => apiClient.post(`/workout-sessions/${sessionId}/sets`, data),
  updateExerciseSet: async (sessionId: string, setId: string, data: any) => apiClient.put(`/workout-sessions/${sessionId}/sets/${setId}`, data),
  getWorkoutSessions: async () => apiClient.get('/workout-sessions'),
  deleteSession: async (id: string) => apiClient.delete(`/workout-sessions/${id}`),
};
