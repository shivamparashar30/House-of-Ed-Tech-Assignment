import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager } from 'react-native';
import { colorScheme } from 'nativewind';
import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  initialize: () => Promise<void>;
}

const STORAGE_KEY = 'bingebox-theme';

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',

  setMode: (mode) => {
    // 1. Update NativeWind immediately (CSS variables switch)
    colorScheme.set(mode);
    // 2. Update Zustand state (re-renders subscribers)
    set({ mode });
    // 3. Persist after UI settles — don't block the tap
    InteractionManager.runAfterInteractions(() => {
      AsyncStorage.setItem(STORAGE_KEY, mode);
    });
  },

  initialize: async () => {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      colorScheme.set(saved);
      set({ mode: saved });
    }
  },
}));
