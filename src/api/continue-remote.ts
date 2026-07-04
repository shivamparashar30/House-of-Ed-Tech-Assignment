import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { ContinueWatchingItem } from '@/stores/continue-watching-store';

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function rowToItem(row: Record<string, unknown>): ContinueWatchingItem {
  return {
    id: row.media_id as number,
    media_type: row.media_type as ContinueWatchingItem['media_type'],
    title: (row.title as string) ?? '',
    poster_path: (row.poster_path as string | null) ?? null,
    backdrop_path: (row.backdrop_path as string | null) ?? null,
    vote_average: Number(row.vote_average) || 0,
    release_date: (row.release_date as string | null) ?? '',
    currentTime: Number(row.current_time_seconds) || 0,
    duration: Number(row.duration_seconds) || 0,
    progress: Number(row.progress) || 0,
    season: (row.season as number | null) ?? undefined,
    episode: (row.episode as number | null) ?? undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at as string).getTime() : 0,
  };
}

export const continueRemote = {
  async fetchAll(): Promise<ContinueWatchingItem[] | null> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return null;
    const { data, error } = await supabase
      .from('continue_watching')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error || !data) return null;
    return data.map(rowToItem);
  },

  async upsert(item: ContinueWatchingItem): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('continue_watching').upsert({
      user_id: id,
      media_id: item.id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
      current_time_seconds: item.currentTime,
      duration_seconds: item.duration,
      progress: item.progress,
      season: item.season ?? null,
      episode: item.episode ?? null,
      updated_at: new Date(item.updatedAt).toISOString(),
    });
  },

  async remove(mediaId: number): Promise<void> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return;
    await supabase.from('continue_watching').delete().eq('user_id', id).eq('media_id', mediaId);
  },
};
