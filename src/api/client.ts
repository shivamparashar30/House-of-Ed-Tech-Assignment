import { mockGet } from '@/api/mock-client';

const BASE_URL = process.env.EXPO_PUBLIC_TMDB_API_BASE || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

const ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN;

export const isTmdbConfigured = Boolean(
  ACCESS_TOKEN && ACCESS_TOKEN !== 'your_tmdb_v4_read_access_token_here',
);

/**
 * When true, all TMDB requests resolve from an in-memory mock data store
 * with artificial network delay — no real API calls are made.
 * Enable by setting  EXPO_PUBLIC_USE_MOCK_API=true  in your .env file.
 */
export const useMockApi = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

type QueryParams = Record<string, string | number | undefined>;

export async function tmdbGet<T>(path: string, params: QueryParams = {}): Promise<T> {
  // Delegate to mock service layer when mock mode is enabled
  if (useMockApi) {
    return mockGet<T>(path, params);
  }

  if (!isTmdbConfigured) {
    throw new Error(
      'TMDB access token is missing. Add EXPO_PUBLIC_TMDB_ACCESS_TOKEN to your .env file.',
    );
  }

  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export function posterUrl(path: string | null, size: 'w342' | 'w500' = 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function profileUrl(path: string | null) {
  return path ? `${IMAGE_BASE_URL}/w185${path}` : null;
}

function playerParams(resumeSeconds: number) {
  const params = new URLSearchParams({ autoPlay: 'true', color: 'e50914' });
  if (resumeSeconds > 0) {
    params.set('progress', String(Math.floor(resumeSeconds)));
  }
  return params.toString();
}

export function vidkingEmbedUrl(movieId: number, resumeSeconds = 0) {
  return `https://www.vidking.net/embed/movie/${movieId}?${playerParams(resumeSeconds)}`;
}

export function vidkingTvEmbedUrl(
  tvId: number,
  season: number,
  episode: number,
  resumeSeconds = 0,
) {
  return `https://www.vidking.net/embed/tv/${tvId}/${season}/${episode}?${playerParams(resumeSeconds)}`;
}
