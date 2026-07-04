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
import { MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { Colors } from '@/constants/theme';
import { useDataSync } from '@/hooks/use-data-sync';
import { useOnboardingWelcome } from '@/hooks/use-onboarding-welcome';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { queryClient } from '@/lib/query-client';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    surface: Colors.surface,
    background: Colors.background,
    onSurface: Colors.text,
    outline: Colors.border,
  },
};

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

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (!isSupabaseConfigured || status === 'loading') return;

    const inAuthScreen = segments[0] === 'auth';

    if (status === 'unauthenticated') {
      if (!inAuthScreen) router.replace('/auth');
      return;
    }

    if (inAuthScreen) {
      router.replace('/');
      return;
    }
  }, [status, segments, router, navigationState?.key]);
}

// Runs inside QueryClientProvider so hooks that need a query client are available.
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
      <PaperProvider theme={paperTheme}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
          </QueryClientProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
