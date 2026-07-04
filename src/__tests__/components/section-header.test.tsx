import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { SectionHeader } from '@/components/section-header';

describe('SectionHeader', () => {
  it('renders the title text', () => {
    render(<SectionHeader title="Trending" />);
    expect(screen.getByText('Trending')).toBeTruthy();
  });

  it('renders different titles', () => {
    render(<SectionHeader title="Popular Movies" />);
    expect(screen.getByText('Popular Movies')).toBeTruthy();
  });
});
