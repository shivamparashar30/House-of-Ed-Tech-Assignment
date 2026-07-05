import { QueryClientProvider } from '@tanstack/react-query';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { colorScheme, useColorScheme, vars } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/global.css';

import { DarkColors, LightColors } from '@/constants/theme';
import { useDataSync } from '@/hooks/use-data-sync';
import { useOnboardingWelcome } from '@/hooks/use-onboarding-welcome';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { IsDarkContext, ThemeColorsContext, useResolvedTheme } from '@/hooks/use-theme-colors';
import { queryClient } from '@/lib/query-client';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AnimatedSplash } from '@/components/animated-splash';
import { useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

// Set dark mode immediately before any component renders
colorScheme.set('dark');

// Pre-computed CSS variable overrides — applied on the root view so all children
// inherit correct values from the very first frame, bypassing the .dark:root
// class-based timing issue in NativeWind.
const darkCssVars = vars({
  '--color-background': '15 15 15',
  '--color-surface': '18 18 18',
  '--color-elevated': '26 26 26',
  '--color-primary': '229 9 20',
  '--color-primary-dark': '176 7 16',
  '--color-accent': '245 197 24',
  '--color-foreground': '255 255 255',
  '--color-muted': '156 163 175',
  '--color-border': '38 38 38',
});
const lightCssVars = vars({
  '--color-background': '245 245 245',
  '--color-surface': '255 255 255',
  '--color-elevated': '255 255 255',
  '--color-primary': '229 9 20',
  '--color-primary-dark': '176 7 16',
  '--color-accent': '245 197 24',
  '--color-foreground': '26 26 26',
  '--color-muted': '107 114 128',
  '--color-border': '229 231 235',
});

// Pre-computed — avoids object allocation on every render
const darkNavTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: DarkColors.background, card: DarkColors.background, text: DarkColors.text, border: DarkColors.border, primary: DarkColors.primary },
};
const lightNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: LightColors.background, card: LightColors.background, text: LightColors.text, border: LightColors.border, primary: LightColors.primary },
};
const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: DarkColors.primary, surface: DarkColors.surface, background: DarkColors.background, onSurface: DarkColors.text, outline: DarkColors.border },
};
const lightPaperTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: LightColors.primary, surface: LightColors.surface, background: LightColors.background, onSurface: LightColors.text, outline: LightColors.border },
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

  const mode = useThemeStore((state) => state.mode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    useThemeStore.getState().initialize();
  }, []);

  // Sync NativeWind with the Zustand store
  useLayoutEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  // Single NativeWind subscription for the entire app
  const { isDark, colors } = useResolvedTheme();
  const navigationTheme = isDark ? darkNavTheme : lightNavTheme;
  const paperTheme = isDark ? darkPaperTheme : lightPaperTheme;

  return (
    <IsDarkContext.Provider value={isDark}>
      <ThemeColorsContext.Provider value={colors}>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={navigationTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: navigationTheme.colors.background },
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
        </PaperProvider>
      </ThemeColorsContext.Provider>
    </IsDarkContext.Provider>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  // Subscribe to theme mode at the root level so CSS variables are injected
  // on the outermost view from the very first frame.
  const mode = useThemeStore((s) => s.mode);
  const { colorScheme: systemScheme } = useColorScheme();
  const isDark = mode === 'system' ? systemScheme !== 'light' : mode === 'dark';
  const rootStyle = useMemo(
    () => [{ flex: 1 }, isDark ? darkCssVars : lightCssVars],
    [isDark],
  );

  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          {!splashDone && <AnimatedSplash onComplete={handleSplashComplete} />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
