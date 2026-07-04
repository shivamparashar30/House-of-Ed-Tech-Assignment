import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { ErrorState } from '@/components/error-state';

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

describe('ErrorState', () => {
  it('renders default error message when no message provided', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText("We couldn't load this content. Please try again.")).toBeTruthy();
  });

  it('renders custom error message', () => {
    render(<ErrorState message="Network error" />);
    expect(screen.getByText('Network error')).toBeTruthy();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Retry')).toBeNull();
  });
});
