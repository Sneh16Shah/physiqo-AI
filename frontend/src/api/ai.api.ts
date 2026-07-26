import apiClient from './client';

export const aiApi = {
  uploadBodyCompScan: async (file: File, reportType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);
    const response = await apiClient.post('/body-composition/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  confirmBodyCompScan: async (id: string, measurements: Record<string, any>) => {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.put(`/body-composition/reports/${id}/confirm`, {
      reportDate: today,
      reportType: 'INBODY',
      measurements: Object.entries(measurements).map(([key, val]) => ({
        metricName: key,
        metricValue: typeof val === 'number' ? val : parseFloat(val) || 0,
        metricUnit: key.includes('pct') || key.includes('percent') ? '%' : (key === 'bmi' ? 'kg/m²' : (key.includes('visceral') ? 'level' : 'kg'))
      }))
    });
    return response.data;
  },

  analyzeProgress: async (params: Record<string, any>) => {
    const response = await apiClient.post('/ai/analyze-progress', params);
    return response.data;
  },

  estimateMealPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/ai/estimate-meal', formData, {
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
