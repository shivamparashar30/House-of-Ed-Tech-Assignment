import type { OSNotification } from 'react-native-onesignal';

import type { AppNotification } from '@/stores/notifications-store';

// Maps a raw OneSignal notification into the inbox entry shape.
export function toAppNotification(notification: OSNotification): Omit<AppNotification, 'read'> {
  return {
    id: notification.notificationId,
    title: notification.title ?? 'BingeBox',
    body: notification.body ?? '',
    launchUrl: notification.launchURL,
    receivedAt: Date.now(),
  };
}
