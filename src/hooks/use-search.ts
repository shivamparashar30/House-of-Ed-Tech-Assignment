import { useQuery } from '@tanstack/react-query';

import { queries } from '@/queries';

export function useSearchMulti(query: string) {
  const trimmed = query.trim();
  return useQuery({
    ...queries.search.multi(trimmed),
    enabled: trimmed.length > 0,
  });
}
