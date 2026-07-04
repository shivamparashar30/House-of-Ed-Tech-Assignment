import { tmdbGet } from '@/api/client';
import type { Paginated, SeasonDetails, TVDetails, TVShow } from '@/api/types';

export const tvApi = {
  trending: () => tmdbGet<Paginated<TVShow>>('/trending/tv/week'),

  popular: () => tmdbGet<Paginated<TVShow>>('/tv/popular'),

  topRated: () => tmdbGet<Paginated<TVShow>>('/tv/top_rated'),

  onTheAir: () => tmdbGet<Paginated<TVShow>>('/tv/on_the_air'),

  detail: (id: number) =>
    tmdbGet<TVDetails>(`/tv/${id}`, { append_to_response: 'credits,similar' }),

  season: (id: number, seasonNumber: number) =>
    tmdbGet<SeasonDetails>(`/tv/${id}/season/${seasonNumber}`),
};
