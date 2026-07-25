import apiClient from './client';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'WHEY' | 'CASEIN' | 'PLANT' | 'CREATINE' | 'PRE_WORKOUT' | 'BCAA' | 'OTHER';
  description?: string;
  is_verified: boolean;
  serving_size?: number;
  servings_per_container?: number;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  ingredients?: string[];
  current_lowest_price?: number;
  image_url?: string;
}

export interface ProductFilterParams {
  query?: string;
  category?: string;
  brand?: string;
  is_verified?: boolean;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export interface PriceAlert {
  id: string;
  product_id: string;
  target_price: number;
  is_active: boolean;
}

export interface PriceHistoryParams {
  days?: number;
}

export const productApi = {
  getProducts: async (params?: ProductFilterParams) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (data: any) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },
  
  updateProduct: async (id: string, data: any) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },
  
  addPrice: async (productId: string, data: any) => {
    const response = await apiClient.post(`/products/${productId}/prices`, data);
    return response.data;
  },
  
  getPriceHistory: async (productId: string, params?: PriceHistoryParams) => {
    const response = await apiClient.get(`/products/${productId}/prices/history`, { params });
    return response.data;
  },
  
  submitVerification: async (productId: string, formData: FormData) => {
    const response = await apiClient.post(`/products/${productId}/verify`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  compareProducts: async (ids: string[]) => {
    const response = await apiClient.get('/products/compare', {
      params: { ids: ids.join(',') },
    });
    return response.data;
  },
  
  getPriceAlerts: async () => {
    const response = await apiClient.get('/price-alerts');
    return response.data;
  },
  
  createPriceAlert: async (data: Omit<PriceAlert, 'id' | 'is_active'>) => {
    const response = await apiClient.post('/price-alerts', data);
    return response.data;
  },
  
  updatePriceAlert: async (id: string, data: Partial<PriceAlert>) => {
    const response = await apiClient.put(`/price-alerts/${id}`, data);
    return response.data;
  },
  
  deletePriceAlert: async (id: string) => {
    const response = await apiClient.delete(`/price-alerts/${id}`);
    return response.data;
  }
};
