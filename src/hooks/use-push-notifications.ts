import { useEffect } from 'react';
import { Platform } from 'react-native';
import {
  LogLevel,
  OneSignal,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
} from 'react-native-onesignal';

import { isOneSignalConfigured, onesignalAppId } from '@/lib/onesignal';
import { toAppNotification } from '@/lib/notification';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

// Push is Android-only, and OneSignal is a native module present only in a
// dev/standalone build — both must hold before we touch the SDK.
const isPushEnabled = Platform.OS === 'android' && isOneSignalConfigured;

export function usePushNotifications() {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (!isPushEnabled) return;

    if (__DEV__) {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    }

    OneSignal.initialize(onesignalAppId);
    OneSignal.Notifications.requestPermission(true);

    const handleForeground = (event: NotificationWillDisplayEvent) => {
      useNotificationsStore.getState().add(toAppNotification(event.getNotification()));
    };

    // Tap while backgrounded/closed — record it since the foreground listener never ran.
    const handleClick = (event: NotificationClickEvent) => {
      useNotificationsStore.getState().add(toAppNotification(event.notification));
    };

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleForeground);
    OneSignal.Notifications.addEventListener('click', handleClick);

    return () => {
      OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handleForeground);
      OneSignal.Notifications.removeEventListener('click', handleClick);
    };
  }, []);

  // Tie the OneSignal external ID to the Supabase user for per-account targeting.
  useEffect(() => {
    if (!isPushEnabled) return;

    if (status === 'authenticated') {
      const userId = useAuthStore.getState().user?.id;
      if (userId) OneSignal.login(userId);
    } else if (status === 'unauthenticated') {
      OneSignal.logout();
    }
  }, [status]);
}
