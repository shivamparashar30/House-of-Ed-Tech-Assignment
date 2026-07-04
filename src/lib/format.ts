export function formatYear(releaseDate: string): string {
  if (!releaseDate) return '';
  return releaseDate.slice(0, 4);
}

export function formatReleaseDate(releaseDate: string): string {
  if (!releaseDate) return 'TBA';
  const date = new Date(releaseDate);
  if (Number.isNaN(date.getTime())) return 'TBA';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatRating(voteAverage: number): string {
  if (!voteAverage || voteAverage <= 0) return 'NR';
  return voteAverage.toFixed(1);
}

export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
