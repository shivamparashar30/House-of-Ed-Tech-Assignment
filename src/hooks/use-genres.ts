import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queries } from '@/queries';
import { mergeGenres } from '@/lib/genres';

export function useUnifiedGenres() {
  const movie = useQuery(queries.genres.movie);
  const tv = useQuery(queries.genres.tv);

  const data = useMemo(
    () => mergeGenres(movie.data?.genres ?? [], tv.data?.genres ?? []),
    [movie.data, tv.data],
  );

  return {
    data,
    isLoading: movie.isLoading || tv.isLoading,
    isError: movie.isError || tv.isError,
  };
}
