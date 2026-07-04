import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { searchApi } from '@/api/search';
import { queries } from '@/queries';

export function useSearchMulti(query: string) {
  const trimmed = query.trim();
  return useQuery({
    ...queries.search.multi(trimmed),
    enabled: trimmed.length > 0,
  });
}

export function useInfiniteSearchMulti(query: string) {
  const trimmed = query.trim();
  return useInfiniteQuery({
    ...queries.search.infinite(trimmed),
    queryFn: ({ pageParam }) => searchApi.multi(trimmed, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: trimmed.length > 0,
  });
}
