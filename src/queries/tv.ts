import { createQueryKeys } from '@lukemorales/query-key-factory';

import { tvApi } from '@/api/tv';

export const tv = createQueryKeys('tv', {
  trending: {
    queryKey: null,
    queryFn: () => tvApi.trending(),
  },
  popular: {
    queryKey: null,
    queryFn: () => tvApi.popular(),
  },
  topRated: {
    queryKey: null,
    queryFn: () => tvApi.topRated(),
  },
  onTheAir: {
    queryKey: null,
    queryFn: () => tvApi.onTheAir(),
  },
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: () => tvApi.detail(id),
  }),
  season: (id: number, seasonNumber: number) => ({
    queryKey: [id, seasonNumber],
    queryFn: () => tvApi.season(id, seasonNumber),
  }),
});
