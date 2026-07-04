import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { collectionsRemote } from '@/api/collections-remote';
import type { MediaType } from '@/api/types';
import { uuidv4 } from '@/lib/uuid';

export interface CollectionItem {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  createdAt: number;
}

interface CollectionsState {
  collections: Collection[];
  createCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  addItem: (collectionId: string, item: CollectionItem) => void;
  removeItem: (collectionId: string, mediaId: number) => void;
  hydrate: () => Promise<void>;
  clear: () => void;
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set, get) => ({
      collections: [],
      createCollection: (name) => {
        const id = uuidv4();
        const collection: Collection = { id, name: name.trim(), items: [], createdAt: Date.now() };
        set({ collections: [...get().collections, collection] });
        collectionsRemote.createCollection(id, collection.name);
        return id;
      },
      renameCollection: (id, name) => {
        set({
          collections: get().collections.map((c) =>
            c.id === id ? { ...c, name: name.trim() } : c,
          ),
        });
        collectionsRemote.renameCollection(id, name.trim());
      },
      deleteCollection: (id) => {
        set({ collections: get().collections.filter((c) => c.id !== id) });
        collectionsRemote.deleteCollection(id);
      },
      addItem: (collectionId, item) => {
        set({
          collections: get().collections.map((c) =>
            c.id === collectionId && !c.items.some((i) => i.id === item.id)
              ? { ...c, items: [item, ...c.items] }
              : c,
          ),
        });
        collectionsRemote.addItem(collectionId, item);
      },
      removeItem: (collectionId, mediaId) => {
        set({
          collections: get().collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: c.items.filter((i) => i.id !== mediaId) }
              : c,
          ),
        });
        collectionsRemote.removeItem(collectionId, mediaId);
      },
      hydrate: async () => {
        const remote = await collectionsRemote.fetchAll();
        if (remote) set({ collections: remote });
      },
      clear: () => set({ collections: [] }),
    }),
    {
      name: 'bingebox-collections',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useIsInAnyCollection(mediaId: number) {
  return useCollectionsStore((state) =>
    state.collections.some((collection) => collection.items.some((item) => item.id === mediaId)),
  );
}
