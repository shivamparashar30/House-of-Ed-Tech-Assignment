import { tmdbGet } from '@/api/client';
import type { MultiSearchItem, Paginated } from '@/api/types';

export const searchApi = {
  multi: (query: string, page = 1) =>
    tmdbGet<Paginated<MultiSearchItem>>('/search/multi', { query, include_adult: 'false', page: String(page) }),
};
