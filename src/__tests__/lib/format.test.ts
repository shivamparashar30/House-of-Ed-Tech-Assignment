import { formatYear, formatReleaseDate, formatRuntime, formatRating, formatRelativeTime } from '@/lib/format';

describe('formatYear', () => {
  it('extracts 4-digit year from date string', () => {
    expect(formatYear('2024-06-15')).toBe('2024');
  });

  it('returns empty string for empty input', () => {
    expect(formatYear('')).toBe('');
  });
});

describe('formatReleaseDate', () => {
  it('formats a valid date string', () => {
    const result = formatReleaseDate('2024-01-15');
    expect(result).toContain('2024');
    expect(result).toContain('January');
    expect(result).toContain('15');
  });

  it('returns TBA for empty string', () => {
    expect(formatReleaseDate('')).toBe('TBA');
  });

  it('returns TBA for invalid date', () => {
    expect(formatReleaseDate('not-a-date')).toBe('TBA');
  });
});

describe('formatRuntime', () => {
  it('formats hours and minutes', () => {
    expect(formatRuntime(125)).toBe('2h 5m');
  });

  it('formats hours only when no remaining minutes', () => {
    expect(formatRuntime(120)).toBe('2h');
  });

  it('formats minutes only when under an hour', () => {
    expect(formatRuntime(45)).toBe('45m');
  });

  it('returns empty string for null', () => {
    expect(formatRuntime(null)).toBe('');
  });

  it('returns empty string for zero', () => {
    expect(formatRuntime(0)).toBe('');
  });

  it('returns empty string for negative', () => {
    expect(formatRuntime(-10)).toBe('');
  });
});

describe('formatRating', () => {
  it('formats rating to one decimal place', () => {
    expect(formatRating(7.856)).toBe('7.9');
  });

  it('keeps trailing zero', () => {
    expect(formatRating(8.0)).toBe('8.0');
  });

  it('returns NR for zero', () => {
    expect(formatRating(0)).toBe('NR');
  });

  it('returns NR for negative', () => {
    expect(formatRating(-1)).toBe('NR');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 10_000)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago within a week', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });

  it('returns formatted date for older timestamps', () => {
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const result = formatRelativeTime(twoWeeksAgo);
    // Should be a short date like "Jun 21"
    expect(result).not.toContain('ago');
  });
});
