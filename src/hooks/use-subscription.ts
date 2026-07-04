import { useQuery } from '@tanstack/react-query';

import { queries } from '@/queries';
import { useAuthStore } from '@/stores/auth-store';

export function useSubscription() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    ...queries.subscription.current(userId ?? ''),
    enabled: Boolean(userId),
    // While a payment is pending ('created'), poll so the paywall clears once
    // the webhook marks it paid, without relaunching the app.
    refetchInterval: (query) => (query.state.data?.status === 'created' ? 4000 : false),
  });
}
