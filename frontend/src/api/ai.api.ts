import apiClient from './client';

export const aiApi = {
  uploadBodyCompScan: async (file: File, reportType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);
    const response = await apiClient.post('/ai/body-comp/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  confirmBodyCompScan: async (id: string, measurements: Record<string, any>) => {
    const response = await apiClient.post(`/ai/body-comp/${id}/confirm`, { measurements });
    return response.data;
  },

  analyzeProgress: async (params: Record<string, any>) => {
    const response = await apiClient.get('/ai/progress/analyze', { params });
    return response.data;
  },

  estimateMealPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/ai/nutrition/estimate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAIInsights: async () => {
    const response = await apiClient.get('/ai/insights');
    return response.data;
  },

  dismissAIInsight: async (id: string) => {
    const response = await apiClient.put(`/ai/insights/${id}/dismiss`);
    return response.data;
  },
};
