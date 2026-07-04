import { createQueryKeys } from '@lukemorales/query-key-factory';

import { moviesApi } from '@/api/movies';

export const movies = createQueryKeys('movies', {
  trending: {
    queryKey: null,
    queryFn: () => moviesApi.trending(),
  },
  popular: {
    queryKey: null,
    queryFn: () => moviesApi.popular(),
  },
  topRated: {
    queryKey: null,
    queryFn: () => moviesApi.topRated(),
  },
  upcoming: {
    queryKey: null,
    queryFn: () => moviesApi.upcoming(),
  },
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: () => moviesApi.detail(id),
  }),
});
