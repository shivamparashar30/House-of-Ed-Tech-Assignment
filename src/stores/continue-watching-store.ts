import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { continueRemote } from '@/api/continue-remote';
import type { MediaType } from '@/api/types';

export interface ContinueWatchingItem {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  currentTime: number;
  duration: number;
  progress: number;
  updatedAt: number;
  season?: number;
  episode?: number;
}

export type ContinueWatchingInput = Pick<
  ContinueWatchingItem,
  | 'id'
  | 'media_type'
  | 'title'
  | 'poster_path'
  | 'backdrop_path'
  | 'vote_average'
  | 'release_date'
  | 'season'
  | 'episode'
>;

export interface PlaybackProgress {
  currentTime: number;
  duration: number;
  progress: number;
}

const MIN_PROGRESS_SECONDS = 10;
const FINISHED_THRESHOLD = 0.95;

interface ContinueWatchingState {
  items: ContinueWatchingItem[];
  upsert: (media: ContinueWatchingInput, playback: PlaybackProgress) => void;
  remove: (id: number) => void;
  hydrate: () => Promise<void>;
  clear: () => void;
}

export const useContinueWatchingStore = create<ContinueWatchingState>()(
  persist(
    (set, get) => ({
      items: [],
      upsert: (media, playback) => {
        const others = get().items.filter((item) => item.id !== media.id);

        if (playback.currentTime < MIN_PROGRESS_SECONDS || playback.progress >= FINISHED_THRESHOLD) {
          set({ items: others });
          continueRemote.remove(media.id);
          return;
        }

        const entry: ContinueWatchingItem = {
          ...media,
          currentTime: playback.currentTime,
          duration: playback.duration,
          progress: playback.progress,
          updatedAt: Date.now(),
        };

        set({ items: [entry, ...others] });
        continueRemote.upsert(entry);
      },
      remove: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
        continueRemote.remove(id);
      },
      hydrate: async () => {
        const remote = await continueRemote.fetchAll();
        if (remote) set({ items: remote });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bingebox-continue-watching',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function getContinueItem(id: number) {
  return useContinueWatchingStore.getState().items.find((item) => item.id === id);
}

export function useContinueProgress(id: number) {
  return useContinueWatchingStore((state) => state.items.find((item) => item.id === id));
}
