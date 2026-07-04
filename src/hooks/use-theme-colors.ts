import { createContext, useContext } from 'react';
import { useColorScheme } from 'nativewind';

import {
  type ThemeColors,
  DarkColors,
  DarkHeroGradient,
  LightColors,
  LightHeroGradient,
} from '@/constants/theme';

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';
  return {
    isDark,
    colors: isDark ? DarkColors : LightColors,
  } as const;
}
