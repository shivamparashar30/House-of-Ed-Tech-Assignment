import { createContext, useContext } from 'react';
import { useColorScheme } from 'nativewind';

import {
  type ThemeColors,
  DarkColors,
  DarkHeroGradient,
  LightColors,
  LightHeroGradient,
} from '@/constants/theme';
import { useThemeStore } from '@/stores/theme-store';

// Single context so only the root provider subscribes to NativeWind.
// All child components read from context — no individual subscriptions.
const ThemeColorsContext = createContext<ThemeColors>(DarkColors);
const IsDarkContext = createContext(true);

export { ThemeColorsContext, IsDarkContext };

/** Must be called inside ThemeColorsProvider. */
export function useThemeColors(): ThemeColors {
  return useContext(ThemeColorsContext);
}

/** Must be called inside ThemeColorsProvider. */
export function useHeroGradient(): readonly string[] {
  const isDark = useContext(IsDarkContext);
  return isDark ? DarkHeroGradient : LightHeroGradient;
}

/** Hook for the root provider only — the single NativeWind subscription. */
export function useResolvedTheme() {
  const mode = useThemeStore((s) => s.mode);
  const { colorScheme } = useColorScheme();

  // For explicit 'dark'/'light', use the store value directly — this avoids
  // the first-render lag where NativeWind's useColorScheme() hasn't synced yet.
  // For 'system' mode, fall back to NativeWind's resolved system preference.
  const isDark = mode === 'system' ? colorScheme !== 'light' : mode === 'dark';

  return {
    isDark,
    colors: isDark ? DarkColors : LightColors,
  } as const;
}
