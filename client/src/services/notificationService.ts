import api from "./api";

export interface Notification {
  _id: string;
  recipient: {
    _id: string;
    name: string;
  };
  sender: {
    _id: string;
    name: string;
  };
  type: 'like' | 'comment' | 'editor_added' | 'post_mention' | 'system';
  read: boolean;
  post?: {
    _id: string;
    title: string;
  };
  comment?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

const notificationService = {
  // Get all notifications with pagination
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Mark notifications as read (all or specific IDs)
  markAsRead: async (notificationIds?: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/notifications/read', { notificationIds });
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export default notificationService;