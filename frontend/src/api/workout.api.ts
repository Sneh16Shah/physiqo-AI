import apiClient from './client';

export const workoutApi = {
  getMuscles: async () => apiClient.get('/workouts/muscles'),
  getExercises: async (params?: any) => apiClient.get('/workouts/exercises', { params }),
  getExerciseById: async (id: string) => apiClient.get(`/workouts/exercises/${id}`),
  createCustomExercise: async (data: any) => apiClient.post('/workouts/exercises', data),
  getWorkoutPlans: async () => apiClient.get('/workouts/plans'),
  getWorkoutPlanById: async (id: string) => apiClient.get(`/workouts/plans/${id}`),
  createWorkoutPlan: async (data: any) => apiClient.post('/workouts/plans', data),
  updateWorkoutPlan: async (id: string, data: any) => apiClient.put(`/workouts/plans/${id}`, data),
  deleteWorkoutPlan: async (id: string) => apiClient.delete(`/workouts/plans/${id}`),
  startWorkoutSession: async (data: any) => apiClient.post('/workouts/sessions', data),
  updateWorkoutSession: async (id: string, data: any) => apiClient.put(`/workouts/sessions/${id}`, data),
  logExerciseSet: async (sessionId: string, data: any) => apiClient.post(`/workouts/sessions/${sessionId}/sets`, data),
  updateExerciseSet: async (setId: string, data: any) => apiClient.put(`/workouts/sessions/sets/${setId}`, data),
  getWorkoutSessions: async () => apiClient.get('/workouts/sessions'),
};
