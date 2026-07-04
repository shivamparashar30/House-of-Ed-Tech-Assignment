import { levenshtein, similarity, relaxQuery } from '@/lib/fuzzy';

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('hello', 'hello')).toBe(0);
  });

  it('returns length of other string when one is empty', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });

  it('calculates correct distance for single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
  });

  it('calculates correct distance for insertion', () => {
    expect(levenshtein('cat', 'cats')).toBe(1);
  });

  it('calculates correct distance for deletion', () => {
    expect(levenshtein('cats', 'cat')).toBe(1);
  });

  it('handles completely different strings', () => {
    expect(levenshtein('abc', 'xyz')).toBe(3);
  });
});

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('hello', 'hello')).toBe(1);
  });

  it('returns 1 when one string contains the other', () => {
    expect(similarity('dark', 'The Dark Knight')).toBe(1);
  });

  it('is case insensitive', () => {
    expect(similarity('HELLO', 'hello')).toBe(1);
  });

  it('returns 0 for empty strings', () => {
    expect(similarity('', 'hello')).toBe(0);
    expect(similarity('hello', '')).toBe(0);
  });

  it('returns value between 0 and 1 for partial matches', () => {
    const score = similarity('cat', 'bat');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe('relaxQuery', () => {
  it('returns empty string for short queries (4 chars or less)', () => {
    expect(relaxQuery('abc')).toBe('');
    expect(relaxQuery('abcd')).toBe('');
  });

  it('trims last 2 characters for longer queries', () => {
    expect(relaxQuery('batman')).toBe('batm');
  });

  it('preserves at least 4 characters', () => {
    // 'hello' = 5 chars, max(4, 5-2) = 4, so returns first 4 chars
    expect(relaxQuery('hello')).toBe('hell');
    expect(relaxQuery('hello').length).toBeGreaterThanOrEqual(4);
  });

  it('trims whitespace before processing', () => {
    expect(relaxQuery('  batman  ')).toBe('batm');
  });
});
