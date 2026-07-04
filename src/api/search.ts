import { tmdbGet } from '@/api/client';
import type { MultiSearchItem, Paginated } from '@/api/types';

export const searchApi = {
  multi: (query: string) =>
    tmdbGet<Paginated<MultiSearchItem>>('/search/multi', { query, include_adult: 'false' }),
};
