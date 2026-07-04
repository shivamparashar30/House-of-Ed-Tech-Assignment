import type { Genre } from '@/api/types';

export interface UnifiedGenre {
  name: string;
  movieId?: number;
  tvId?: number;
}

export function mergeGenres(movieGenres: Genre[], tvGenres: Genre[]): UnifiedGenre[] {
  const map = new Map<string, UnifiedGenre>();

  for (const genre of movieGenres) {
    map.set(genre.name, { ...(map.get(genre.name) ?? { name: genre.name }), movieId: genre.id });
  }
  for (const genre of tvGenres) {
    map.set(genre.name, { ...(map.get(genre.name) ?? { name: genre.name }), tvId: genre.id });
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
