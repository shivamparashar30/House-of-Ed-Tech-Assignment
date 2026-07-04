import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { WatchlistItem } from '@/stores/watchlist-store';

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function rowToItem(row: Record<string, unknown>): WatchlistItem {
  return {
    id: row.media_id as number,
    media_type: row.media_type as WatchlistItem['media_type'],
    title: (row.title as string) ?? '',
    poster_path: (row.poster_path as string | null) ?? null,
    backdrop_path: (row.backdrop_path as string | null) ?? null,
    vote_average: Number(row.vote_average) || 0,
    release_date: (row.release_date as string | null) ?? '',
  };
}

export const watchlistRemote = {
  async fetchAll(): Promise<WatchlistItem[] | null> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return null;
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(rowToItem);
  },

  async upsert(item: WatchlistItem): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('watchlist').upsert({
      user_id: id,
      media_id: item.id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
    });
  },

  async remove(mediaId: number): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('watchlist').delete().eq('user_id', id).eq('media_id', mediaId);
  },
};
