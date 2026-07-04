import { QueryClientProvider } from '@tanstack/react-query';
import {
  DarkTheme,
  Stack,
  ThemeProvider,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { Colors } from '@/constants/theme';
import { useDataSync } from '@/hooks/use-data-sync';
import { useOnboardingWelcome } from '@/hooks/use-onboarding-welcome';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useSubscription } from '@/hooks/use-subscription';
import { queryClient } from '@/lib/query-client';
import { isSubscriptionActive, isSubscriptionEnforced } from '@/lib/subscription';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.border,
    primary: Colors.primary,
  },
};

function useAuthGate() {
  const status = useAuthStore((state) => state.status);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!isSupabaseConfigured || status === 'loading') return;

    const inAuthScreen = segments[0] === 'auth';
    const inPaywall = segments[0] === 'paywall';

    if (status === 'unauthenticated') {
      if (!inAuthScreen) router.replace('/auth');
      return;
    }

    if (inAuthScreen) {
      router.replace('/');
      return;
    }

    // Wait for the subscription status to load so we don't flash the paywall.
    if (!isSubscriptionEnforced || subscriptionLoading) return;

    const active = isSubscriptionActive(subscription);
    if (!active && !inPaywall) {
      router.replace('/paywall');
    } else if (active && inPaywall) {
      router.replace('/');
    }
  }, [status, segments, router, navigationState?.key, subscription, subscriptionLoading]);
}

// Runs inside QueryClientProvider so the auth gate's subscription query has a client.
function RootNavigator() {
  useAuthGate();
  useDataSync();
  usePushNotifications();
  useOnboardingWelcome();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" />
        <Stack.Screen name="tv/[id]" />
        <Stack.Screen name="collection/[id]" />
        <Stack.Screen name="account" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen name="paywall" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="player/[id]"
          options={{ presentation: 'modal', animation: 'fade' }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
