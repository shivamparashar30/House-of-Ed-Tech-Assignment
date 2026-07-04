import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Collection, CollectionItem } from '@/stores/collections-store';

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function rowToItem(row: Record<string, unknown>): CollectionItem {
  return {
    id: row.media_id as number,
    media_type: row.media_type as CollectionItem['media_type'],
    title: (row.title as string) ?? '',
    poster_path: (row.poster_path as string | null) ?? null,
    vote_average: Number(row.vote_average) || 0,
    release_date: (row.release_date as string | null) ?? '',
  };
}

export const collectionsRemote = {
  async fetchAll(): Promise<Collection[] | null> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return null;

    const [collectionsRes, itemsRes] = await Promise.all([
      supabase.from('collections').select('*').order('created_at', { ascending: true }),
      supabase.from('collection_items').select('*'),
    ]);
    if (collectionsRes.error || !collectionsRes.data) return null;

    const items = itemsRes.data ?? [];
    return collectionsRes.data.map((collection) => ({
      id: collection.id as string,
      name: collection.name as string,
      createdAt: collection.created_at
        ? new Date(collection.created_at as string).getTime()
        : 0,
      items: items.filter((i) => i.collection_id === collection.id).map(rowToItem),
    }));
  },

  async createCollection(collectionId: string, name: string): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('collections').insert({ id: collectionId, user_id: id, name });
  },

  async renameCollection(collectionId: string, name: string): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('collections').update({ name }).eq('id', collectionId);
  },

  async deleteCollection(collectionId: string): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('collections').delete().eq('id', collectionId);
  },

  async addItem(collectionId: string, item: CollectionItem): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('collection_items').upsert({
      collection_id: collectionId,
      user_id: id,
      media_id: item.id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
    });
  },

  async removeItem(collectionId: string, mediaId: number): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('media_id', mediaId);
  },
};
