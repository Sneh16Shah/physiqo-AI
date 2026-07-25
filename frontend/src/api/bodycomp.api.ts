import apiClient from './client';

export const bodyCompApi = {
  createReport: async (data: any) => apiClient.post('/body-composition/reports', data),
  getReports: async () => apiClient.get('/body-composition/reports'),
  getReportById: async (id: string) => apiClient.get(`/body-composition/reports/${id}`),
  deleteReport: async (id: string) => apiClient.delete(`/body-composition/reports/${id}`),
  getTrends: async () => apiClient.get('/body-composition/trends'),
  createBodyMeasurement: async (data: any) => apiClient.post('/body-composition/measurements', data),
  getBodyMeasurements: async () => apiClient.get('/body-composition/measurements'),
  updateBodyMeasurement: async (id: string, data: any) => apiClient.put(`/body-composition/measurements/${id}`, data),
  deleteBodyMeasurement: async (id: string) => apiClient.delete(`/body-composition/measurements/${id}`),
};
