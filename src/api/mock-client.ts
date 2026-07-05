/**
 * Mock API client — resolves mock JSON data via an async abstraction,
 * mimicking real network fetching with configurable artificial delay.
 *
 * Enable by setting  EXPO_PUBLIC_USE_MOCK_API=true  in your .env file.
 */

import {
  MOCK_MOVIE_GENRES,
  MOCK_ON_AIR_TV,
  MOCK_POPULAR_MOVIES,
  MOCK_POPULAR_TV,
  MOCK_TOP_RATED_MOVIES,
  MOCK_TOP_RATED_TV,
  MOCK_TRENDING_MOVIES,
  MOCK_TRENDING_TV,
  MOCK_TV_GENRES,
  MOCK_UPCOMING_MOVIES,
  buildMockDiscoverMovies,
  buildMockDiscoverTv,
  buildMockMovieDetail,
  buildMockSearchResults,
  buildMockSeasonDetail,
  buildMockTvDetail,
} from '@/api/mock-data';

// Simulates network latency between 300-800ms
const MIN_DELAY = 300;
const MAX_DELAY = 800;

function randomDelay(): number {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

async function simulateNetwork<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));
  return structuredClone(data) as T;
}

// Route map: matches TMDB URL patterns to mock data resolvers
type RouteParams = Record<string, string | number | undefined>;

const routes: {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, params: RouteParams) => unknown;
}[] = [
  // Movies
  { pattern: /^\/trending\/movie\/week$/, handler: () => MOCK_TRENDING_MOVIES },
  { pattern: /^\/movie\/popular$/, handler: () => MOCK_POPULAR_MOVIES },
  { pattern: /^\/movie\/top_rated$/, handler: () => MOCK_TOP_RATED_MOVIES },
  { pattern: /^\/movie\/upcoming$/, handler: () => MOCK_UPCOMING_MOVIES },
  { pattern: /^\/movie\/(\d+)$/, handler: (m) => buildMockMovieDetail(Number(m[1])) },

  // TV
  { pattern: /^\/trending\/tv\/week$/, handler: () => MOCK_TRENDING_TV },
  { pattern: /^\/tv\/popular$/, handler: () => MOCK_POPULAR_TV },
  { pattern: /^\/tv\/top_rated$/, handler: () => MOCK_TOP_RATED_TV },
  { pattern: /^\/tv\/on_the_air$/, handler: () => MOCK_ON_AIR_TV },
  { pattern: /^\/tv\/(\d+)\/season\/(\d+)$/, handler: (m) => buildMockSeasonDetail(Number(m[2])) },
  { pattern: /^\/tv\/(\d+)$/, handler: (m) => buildMockTvDetail(Number(m[1])) },

  // Genres
  { pattern: /^\/genre\/movie\/list$/, handler: () => ({ genres: MOCK_MOVIE_GENRES }) },
  { pattern: /^\/genre\/tv\/list$/, handler: () => ({ genres: MOCK_TV_GENRES }) },

  // Discover
  {
    pattern: /^\/discover\/movie$/,
    handler: (_m, p) => buildMockDiscoverMovies(Number(p.with_genres) || 28),
  },
  {
    pattern: /^\/discover\/tv$/,
    handler: (_m, p) => buildMockDiscoverTv(Number(p.with_genres) || 18),
  },

  // Search
  {
    pattern: /^\/search\/multi$/,
    handler: (_m, p) => buildMockSearchResults(String(p.query ?? '')),
  },
];

/**
 * Drop-in replacement for `tmdbGet` that resolves mock data with a
 * simulated network delay. Matches the same function signature.
 */
export async function mockGet<T>(path: string, params: RouteParams = {}): Promise<T> {
  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      const data = route.handler(match, params);
      return simulateNetwork(data) as Promise<T>;
    }
  }

  // Fallback — return an empty paginated response for unmatched routes
  if (__DEV__) {
    console.warn(`[MockAPI] No mock handler for path: ${path}`);
  }
  return simulateNetwork({ page: 1, results: [], total_pages: 0, total_results: 0 }) as Promise<T>;
}
