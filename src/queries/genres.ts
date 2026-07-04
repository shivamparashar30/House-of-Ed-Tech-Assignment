import { createQueryKeys } from '@lukemorales/query-key-factory';

import { genresApi } from '@/api/genres';

export const genres = createQueryKeys('genres', {
  movie: {
    queryKey: null,
    queryFn: () => genresApi.movieList(),
  },
  tv: {
    queryKey: null,
    queryFn: () => genresApi.tvList(),
  },
});
