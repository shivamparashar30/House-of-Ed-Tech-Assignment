import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { MediaType } from '@/api/types';
import { watchlistRemote } from '@/api/watchlist-remote';

export interface WatchlistItem {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
}

interface WatchlistState {
  items: WatchlistItem[];
  toggle: (item: WatchlistItem) => void;
  remove: (id: number) => void;
  hydrate: () => Promise<void>;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((existing) => existing.id === item.id);
        if (exists) {
          set({ items: get().items.filter((existing) => existing.id !== item.id) });
          watchlistRemote.remove(item.id);
        } else {
          set({ items: [item, ...get().items] });
          watchlistRemote.upsert(item);
        }
      },
      remove: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
        watchlistRemote.remove(id);
      },
      hydrate: async () => {
        const remote = await watchlistRemote.fetchAll();
        if (remote) set({ items: remote });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bingebox-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useIsInWatchlist(id: number) {
  return useWatchlistStore((state) => state.items.some((item) => item.id === id));
}
