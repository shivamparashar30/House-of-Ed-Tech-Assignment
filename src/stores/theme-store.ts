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
    colorScheme.set(mode);
    set({ mode });
    InteractionManager.runAfterInteractions(() => {
      AsyncStorage.setItem(STORAGE_KEY, mode);
    });
  },

  initialize: async () => {
    const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    const mode = saved && ['system', 'light', 'dark'].includes(saved) ? saved : 'dark';
    colorScheme.set(mode);
    set({ mode });
  },
}));
