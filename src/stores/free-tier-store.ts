import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const FREE_TIER_LIMIT = 3;

interface FreeTierState {
  watchedIds: number[];
  addWatched: (mediaId: number) => void;
  hasReachedLimit: (mediaId: number) => boolean;
  clear: () => void;
}

export const useFreeTierStore = create<FreeTierState>()(
  persist(
    (set, get) => ({
      watchedIds: [],
      addWatched: (mediaId) => {
        const { watchedIds } = get();
        if (watchedIds.includes(mediaId)) return;
        set({ watchedIds: [...watchedIds, mediaId] });
      },
      hasReachedLimit: (mediaId) => {
        const { watchedIds } = get();
        if (watchedIds.includes(mediaId)) return false;
        return watchedIds.length >= FREE_TIER_LIMIT;
      },
      clear: () => set({ watchedIds: [] }),
    }),
    {
      name: 'bingebox-free-tier',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
