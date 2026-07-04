import { useEffect } from 'react';

import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useCollectionsStore } from '@/stores/collections-store';
import { useContinueWatchingStore } from '@/stores/continue-watching-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useWatchlistStore } from '@/stores/watchlist-store';

export function useDataSync() {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    if (status === 'authenticated') {
      useWatchlistStore.getState().hydrate();
      useContinueWatchingStore.getState().hydrate();
      useCollectionsStore.getState().hydrate();
    } else if (status === 'unauthenticated') {
      useWatchlistStore.getState().clear();
      useContinueWatchingStore.getState().clear();
      useCollectionsStore.getState().clear();
      useNotificationsStore.getState().clear();
    }
  }, [status]);
}
