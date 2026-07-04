import { createQueryKeys } from '@lukemorales/query-key-factory';

import { subscriptionRemote } from '@/api/subscription-remote';

export const subscription = createQueryKeys('subscription', {
  current: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => subscriptionRemote.fetchCurrent(),
  }),
});
