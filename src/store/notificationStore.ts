import { create } from 'zustand';
import type { PushNotification } from '@/types';
import { notificationService } from '@/services';

interface NotificationState {
  notifications: PushNotification[];
  unreadCount: number;
  fetch: (recipientId: string) => Promise<void>;
  markRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async (recipientId) => {
    const notifications = await notificationService.list(recipientId);
    set({ notifications, unreadCount: notifications.filter(n => !n.read).length });
  },

  markRead: async (id) => {
    await notificationService.markRead(id);
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
}));
