import { useQuery } from '@tanstack/react-query';

import { queries } from '@/queries';

export function useDiscoverMoviesByGenre(genreId?: number) {
  return useQuery({
    ...queries.discover.moviesByGenre(genreId ?? 0),
    enabled: Boolean(genreId),
  });
}

export function useDiscoverTvByGenre(genreId?: number) {
  return useQuery({
    ...queries.discover.tvByGenre(genreId ?? 0),
    enabled: Boolean(genreId),
  });
}
