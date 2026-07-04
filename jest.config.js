module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-css-interop|react-native-reanimated|@supabase/.*|react-native-url-polyfill)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  collectCoverageFrom: [
    'src/lib/cn.ts',
    'src/lib/format.ts',
    'src/lib/fuzzy.ts',
    'src/lib/media.ts',
    'src/lib/subscription.ts',
    'src/stores/watchlist-store.ts',
    'src/components/empty-state.tsx',
    'src/components/error-state.tsx',
    'src/components/section-header.tsx',
  ],
};
