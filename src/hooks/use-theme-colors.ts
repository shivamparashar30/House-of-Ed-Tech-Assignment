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

const ThemeColorsContext = createContext<ThemeColors>(DarkColors);
const IsDarkContext = createContext(true);

export { ThemeColorsContext, IsDarkContext };

export function useThemeColors(): ThemeColors {
  return useContext(ThemeColorsContext);
}

export function useHeroGradient(): readonly string[] {
  const isDark = useContext(IsDarkContext);
  return isDark ? DarkHeroGradient : LightHeroGradient;
}

export function useResolvedTheme() {
  const mode = useThemeStore((s) => s.mode);
  const { colorScheme } = useColorScheme();
  const isDark = mode === 'system' ? colorScheme !== 'light' : mode === 'dark';

  return {
    isDark,
    colors: isDark ? DarkColors : LightColors,
  } as const;
}
