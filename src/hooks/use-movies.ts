import { useQuery } from '@tanstack/react-query';

import { queries } from '@/queries';

export function useTrendingMovies() {
  return useQuery(queries.movies.trending);
}

export function usePopularMovies() {
  return useQuery(queries.movies.popular);
}

export function useTopRatedMovies() {
  return useQuery(queries.movies.topRated);
}

export function useUpcomingMovies() {
  return useQuery(queries.movies.upcoming);
}

export function useMovieDetail(id: number) {
  return useQuery({
    ...queries.movies.detail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
