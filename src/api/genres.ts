import { tmdbGet } from '@/api/client';
import type { Genre } from '@/api/types';

export const genresApi = {
  movieList: () => tmdbGet<{ genres: Genre[] }>('/genre/movie/list'),
  tvList: () => tmdbGet<{ genres: Genre[] }>('/genre/tv/list'),
};
