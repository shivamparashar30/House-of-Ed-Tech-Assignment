import { tmdbGet } from '@/api/client';
import type { Movie, Paginated, TVShow } from '@/api/types';

export const discoverApi = {
  moviesByGenre: (genreId: number) =>
    tmdbGet<Paginated<Movie>>('/discover/movie', {
      with_genres: genreId,
      sort_by: 'popularity.desc',
    }),

  tvByGenre: (genreId: number) =>
    tmdbGet<Paginated<TVShow>>('/discover/tv', {
      with_genres: genreId,
      sort_by: 'popularity.desc',
    }),
};
