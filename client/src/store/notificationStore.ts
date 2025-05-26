import { create } from 'zustand';
import notificationService, { Notification } from '@/services/notificationService';
import { AxiosError } from 'axios';
import { postToast } from '@/utils/toast';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalNotifications: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (notificationIds?: string[]) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalNotifications: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  fetchNotifications: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await notificationService.getNotifications(page, limit);

      if (response.success) {
        set({
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount,
          totalNotifications: response.data.total,
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to fetch notifications';
      set({ error: errorMessage });
      postToast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationIds?: string[]) => {
    try {
      const response = await notificationService.markAsRead(notificationIds);
      
      if (response.success) {
        // If specific notifications were marked as read
        if (notificationIds && notificationIds.length > 0) {
          set(state => ({
            notifications: state.notifications.map(notification => 
              notificationIds.includes(notification._id) 
                ? { ...notification, read: true } 
                : notification
            ),
            unreadCount: Math.max(0, state.unreadCount - notificationIds.length)
          }));
        } else {
          // All notifications were marked as read
          set(state => ({
            notifications: state.notifications.map(notification => ({ ...notification, read: true })),
            unreadCount: 0
          }));
        }
        postToast.success(response.message);
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to mark notifications as read';
      postToast.error(errorMessage);
      return false;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const response = await notificationService.deleteNotification(id);
      
      if (response.success) {
        set(state => {
          const notification = state.notifications.find(n => n._id === id);
          const newUnreadCount = notification && !notification.read 
            ? state.unreadCount - 1 
            : state.unreadCount;
          
          return {
            notifications: state.notifications.filter(notification => notification._id !== id),
            unreadCount: Math.max(0, newUnreadCount),
            totalNotifications: state.totalNotifications - 1
          };
        });
        postToast.success(response.message);
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to delete notification';
      postToast.error(errorMessage);
      return false;
    }
  },

  resetNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      totalNotifications: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      error: null
    });
  }
}));