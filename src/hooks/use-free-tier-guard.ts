import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useSubscription } from '@/hooks/use-subscription';
import { isSubscriptionActive, isSubscriptionEnforced } from '@/lib/subscription';
import { useFreeTierStore } from '@/stores/free-tier-store';

export function useFreeTierGuard() {
  const router = useRouter();
  const { data: subscription } = useSubscription();
  const hasReachedLimit = useFreeTierStore((state) => state.hasReachedLimit);
  const addWatched = useFreeTierStore((state) => state.addWatched);

  const tryPlay = useCallback(
    (mediaId: number, navigate: () => void) => {
      if (!isSubscriptionEnforced || isSubscriptionActive(subscription)) {
        navigate();
        return;
      }

      if (hasReachedLimit(mediaId)) {
        Alert.alert(
          'Free Limit Reached',
          'You have watched 3 free movies. Subscribe to enjoy unlimited access to all content.',
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Subscribe',
              onPress: () => router.push('/paywall'),
            },
          ],
        );
        return;
      }

      addWatched(mediaId);
      navigate();
    },
    [subscription, hasReachedLimit, addWatched, router],
  );

  return { tryPlay };
}
