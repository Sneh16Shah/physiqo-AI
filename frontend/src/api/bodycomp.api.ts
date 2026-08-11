import apiClient from './client';

export const bodyCompApi = {
  createReport: async (data: any) => apiClient.post('/body-composition/reports', data),
  getReports: async (params?: { page?: number; size?: number; sort?: string; from?: string; to?: string }) => 
    apiClient.get('/body-composition/reports', { params }),
  getReportById: async (id: string) => apiClient.get(`/body-composition/reports/${id}`),
  deleteReport: async (id: string) => apiClient.delete(`/body-composition/reports/${id}`),
  updateReport: async (id: string, data: any) => apiClient.put(`/body-composition/reports/${id}/confirm`, data),
  getTrends: async () => apiClient.get('/body-composition/trends'),
  createBodyMeasurement: async (data: any) => apiClient.post('/body-measurements', data),
  getBodyMeasurements: async (params?: any) => apiClient.get('/body-measurements', { params }),
  updateBodyMeasurement: async (id: string, data: any) => apiClient.put(`/body-measurements/${id}`, data),
  deleteBodyMeasurement: async (id: string) => apiClient.delete(`/body-measurements/${id}`),
};
