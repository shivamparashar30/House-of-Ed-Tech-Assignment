import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  launchUrl?: string;
  receivedAt: number;
  read: boolean;
}

// Keep the inbox bounded so persisted storage can't grow without limit.
const MAX_ITEMS = 100;

interface NotificationsState {
  items: AppNotification[];
  add: (notification: Omit<AppNotification, 'read'>) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (notification) => {
        // A notification shown in the foreground and then tapped fires twice;
        // dedupe on the OneSignal notification id so the inbox shows it once.
        const exists = get().items.some((item) => item.id === notification.id);
        if (exists) return;

        const entry: AppNotification = { ...notification, read: false };
        set({ items: [entry, ...get().items].slice(0, MAX_ITEMS) });
      },
      markAllRead: () => {
        set({ items: get().items.map((item) => ({ ...item, read: true })) });
      },
      remove: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bingebox-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useUnreadNotificationCount() {
  return useNotificationsStore((state) => state.items.filter((item) => !item.read).length);
}
