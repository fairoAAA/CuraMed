import type { INotificationService } from '@/services/interfaces';
import type { PushNotification } from '@/types';
import { timeService } from './timeService';

let notifications: PushNotification[] = [];

class MockNotificationService implements INotificationService {
  async emit(notif: Omit<PushNotification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const record: PushNotification = {
      ...notif,
      id: `notif-${timeService.now().getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: timeService.now().toISOString(),
      read: false,
    };
    notifications.push(record);
    console.info('[Notification →', notif.recipientId, ']', notif.title, '-', notif.body);
  }

  async list(recipientId: string): Promise<PushNotification[]> {
    await delay(200);
    return notifications
      .filter(n => n.recipientId === recipientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markRead(notificationId: string): Promise<void> {
    const n = notifications.find(n => n.id === notificationId);
    if (n) n.read = true;
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const notificationService: INotificationService = new MockNotificationService();
