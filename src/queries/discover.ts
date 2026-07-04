import { createQueryKeys } from '@lukemorales/query-key-factory';

import { discoverApi } from '@/api/discover';

export const discover = createQueryKeys('discover', {
  moviesByGenre: (genreId: number) => ({
    queryKey: [genreId],
    queryFn: () => discoverApi.moviesByGenre(genreId),
  }),
  tvByGenre: (genreId: number) => ({
    queryKey: [genreId],
    queryFn: () => discoverApi.tvByGenre(genreId),
  }),
});
