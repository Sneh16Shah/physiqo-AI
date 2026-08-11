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
      measurements: Object.entries(measurements).map(([key, val]) => {
        let unit = 'kg';
        if (key.includes('pct') || key.includes('percent')) {
          unit = '%';
        } else if (key === 'bmi') {
          unit = 'kg/m²';
        } else if (key.includes('bmr')) {
          unit = 'kcal';
        } else if (key.includes('score')) {
          unit = 'score';
        } else if (key.includes('ratio') || key.includes('rate')) {
          unit = 'ratio';
        } else if (key.includes('visceral')) {
          unit = 'level';
        }
        return {
          metricName: key,
          metricValue: typeof val === 'number' ? val : parseFloat(val) || 0,
          metricUnit: unit,
        };
      })
    });
    console.log("body scan confirm response", response);
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
