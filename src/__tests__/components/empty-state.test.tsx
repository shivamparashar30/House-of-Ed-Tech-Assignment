import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { EmptyState } from '@/components/empty-state';

jest.mock('@/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    background: '#0F0F0F',
    surface: '#121212',
    elevated: '#1A1A1A',
    primary: '#E50914',
    primaryDark: '#B00710',
    accent: '#F5C518',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    border: '#262626',
  }),
}));

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(
      <EmptyState
        icon="bookmark-outline"
        title="No bookmarks"
        message="Save movies to see them here."
      />,
    );
    expect(screen.getByText('No bookmarks')).toBeTruthy();
    expect(screen.getByText('Save movies to see them here.')).toBeTruthy();
  });
});
