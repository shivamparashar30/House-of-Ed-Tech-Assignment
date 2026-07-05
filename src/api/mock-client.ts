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

const MIN_DELAY = 300;
const MAX_DELAY = 800;

function randomDelay(): number {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

async function simulateNetwork<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()));
  return structuredClone(data) as T;
}

type RouteParams = Record<string, string | number | undefined>;

const routes: {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, params: RouteParams) => unknown;
}[] = [
  { pattern: /^\/trending\/movie\/week$/, handler: () => MOCK_TRENDING_MOVIES },
  { pattern: /^\/movie\/popular$/, handler: () => MOCK_POPULAR_MOVIES },
  { pattern: /^\/movie\/top_rated$/, handler: () => MOCK_TOP_RATED_MOVIES },
  { pattern: /^\/movie\/upcoming$/, handler: () => MOCK_UPCOMING_MOVIES },
  { pattern: /^\/movie\/(\d+)$/, handler: (m) => buildMockMovieDetail(Number(m[1])) },
  { pattern: /^\/trending\/tv\/week$/, handler: () => MOCK_TRENDING_TV },
  { pattern: /^\/tv\/popular$/, handler: () => MOCK_POPULAR_TV },
  { pattern: /^\/tv\/top_rated$/, handler: () => MOCK_TOP_RATED_TV },
  { pattern: /^\/tv\/on_the_air$/, handler: () => MOCK_ON_AIR_TV },
  { pattern: /^\/tv\/(\d+)\/season\/(\d+)$/, handler: (m) => buildMockSeasonDetail(Number(m[2])) },
  { pattern: /^\/tv\/(\d+)$/, handler: (m) => buildMockTvDetail(Number(m[1])) },
  { pattern: /^\/genre\/movie\/list$/, handler: () => ({ genres: MOCK_MOVIE_GENRES }) },
  { pattern: /^\/genre\/tv\/list$/, handler: () => ({ genres: MOCK_TV_GENRES }) },
  {
    pattern: /^\/discover\/movie$/,
    handler: (_m, p) => buildMockDiscoverMovies(Number(p.with_genres) || 28),
  },
  {
    pattern: /^\/discover\/tv$/,
    handler: (_m, p) => buildMockDiscoverTv(Number(p.with_genres) || 18),
  },
  {
    pattern: /^\/search\/multi$/,
    handler: (_m, p) => buildMockSearchResults(String(p.query ?? '')),
  },
];

export async function mockGet<T>(path: string, params: RouteParams = {}): Promise<T> {
  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      const data = route.handler(match, params);
      return simulateNetwork(data) as Promise<T>;
    }
  }

  if (__DEV__) {
    console.warn(`[MockAPI] No mock handler for path: ${path}`);
  }
  return simulateNetwork({ page: 1, results: [], total_pages: 0, total_results: 0 }) as Promise<T>;
}
