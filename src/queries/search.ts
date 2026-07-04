import { createQueryKeys } from '@lukemorales/query-key-factory';

import { searchApi } from '@/api/search';

export const search = createQueryKeys('search', {
  multi: (query: string) => ({
    queryKey: [query],
    queryFn: () => searchApi.multi(query),
  }),
});
