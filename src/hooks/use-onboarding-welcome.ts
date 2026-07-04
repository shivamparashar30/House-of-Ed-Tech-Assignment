import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { OneSignal } from 'react-native-onesignal';

import { useSubscription } from '@/hooks/use-subscription';
import { isOneSignalConfigured } from '@/lib/onesignal';
import { isSubscriptionActive, isSubscriptionEnforced } from '@/lib/subscription';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';

// Trigger/tag key OneSignal listens on for the optional dashboard welcome push.
const WELCOME_TRIGGER = 'onboarded';
const WELCOME_FLAG_PREFIX = 'bingebox.welcomed.';

const isPushEnabled = Platform.OS === 'android' && isOneSignalConfigured;

// Fires the welcome exactly once per user, the first time they reach Home as a
// full user (after signup, or after payment when the paywall is enforced).
export function useOnboardingWelcome() {
  const status = useAuthStore((state) => state.status);
  const { data: subscription } = useSubscription();
  const firing = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (isSubscriptionEnforced && !isSubscriptionActive(subscription)) return;
    if (firing.current) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    firing.current = true;
    fireWelcomeOnce(userId);
  }, [status, subscription]);
}

async function fireWelcomeOnce(userId: string) {
  const flagKey = WELCOME_FLAG_PREFIX + userId;
  const alreadyWelcomed = await AsyncStorage.getItem(flagKey);
  if (alreadyWelcomed) return;

  await AsyncStorage.setItem(flagKey, '1');

  useNotificationsStore.getState().add({
    id: `welcome-${userId}`,
    title: 'Welcome to BingeBox 🎬',
    body: 'Your binge starts now — explore trending movies and shows.',
    receivedAt: Date.now(),
  });

  // Fire the OneSignal trigger/tag for the optional dashboard welcome push.
  if (isPushEnabled) {
    OneSignal.InAppMessages.addTrigger(WELCOME_TRIGGER, '1');
    OneSignal.User.addTag(WELCOME_TRIGGER, '1');
  }
}
