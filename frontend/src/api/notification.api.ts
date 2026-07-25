import apiClient from './client';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationFilterParams {
  unread_only?: boolean;
  limit?: number;
  page?: number;
}

export const notificationApi = {
  getNotifications: async (params?: NotificationFilterParams) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },
  
  markNotificationRead: async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllNotificationsRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  }
};
