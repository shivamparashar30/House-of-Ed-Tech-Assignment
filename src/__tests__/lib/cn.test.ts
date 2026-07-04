import { cn } from '@/lib/cn';

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('flex-1', 'bg-white')).toBe('flex-1 bg-white');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('filters out falsy values', () => {
    expect(cn('base', false, null, undefined, 'extra')).toBe('base extra');
  });

  it('resolves tailwind conflicts by keeping the last one', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });
});
