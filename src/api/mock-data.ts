import type {
  CastMember,
  Credits,
  Episode,
  Genre,
  Movie,
  MovieDetails,
  MultiSearchItem,
  Paginated,
  Season,
  SeasonDetails,
  TVDetails,
  TVShow,
} from '@/api/types';


export const MOCK_MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10749, name: 'Romance' },
  { id: 16, name: 'Animation' },
  { id: 80, name: 'Crime' },
];

export const MOCK_TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 10768, name: 'War & Politics' },
  { id: 10766, name: 'Soap' },
];


const mockMovieBase: Movie[] = [
  {
    id: 1001,
    title: 'The Last Frontier',
    overview: 'A lone astronaut must survive on a barren planet after a crash landing, using only ingenuity and the fragments of the ship.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.2,
    release_date: '2025-03-15',
    genre_ids: [878, 18],
  },
  {
    id: 1002,
    title: 'Midnight Chase',
    overview: 'A detective races against time to uncover a conspiracy that threatens to destroy the city.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.5,
    release_date: '2025-06-22',
    genre_ids: [53, 80],
  },
  {
    id: 1003,
    title: 'Ocean\'s Whisper',
    overview: 'Two strangers find an unexpected connection during a transatlantic voyage.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.8,
    release_date: '2024-12-01',
    genre_ids: [10749, 18],
  },
  {
    id: 1004,
    title: 'Shadow Warriors',
    overview: 'An elite squad is sent on a covert mission deep behind enemy lines.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.1,
    release_date: '2025-01-10',
    genre_ids: [28, 53],
  },
  {
    id: 1005,
    title: 'The Forgotten Kingdom',
    overview: 'An archaeologist discovers a hidden civilization beneath the Sahara desert.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.0,
    release_date: '2025-04-20',
    genre_ids: [12, 18],
  },
  {
    id: 1006,
    title: 'Laugh Track',
    overview: 'A struggling comedian accidentally becomes a viral sensation overnight.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 6.9,
    release_date: '2025-02-14',
    genre_ids: [35],
  },
  {
    id: 1007,
    title: 'Code Red',
    overview: 'A cybersecurity analyst uncovers a digital weapon that could shut down an entire nation.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.6,
    release_date: '2025-05-30',
    genre_ids: [53, 878],
  },
  {
    id: 1008,
    title: 'Beneath the Surface',
    overview: 'A marine biologist encounters a terrifying deep-sea creature during a routine dive.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 6.8,
    release_date: '2024-10-31',
    genre_ids: [27, 878],
  },
  {
    id: 1009,
    title: 'Golden Hour',
    overview: 'Emergency room doctors face their most challenging night when a bus accident floods the hospital.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.4,
    release_date: '2025-07-01',
    genre_ids: [18],
  },
  {
    id: 1010,
    title: 'Pixel Quest',
    overview: 'A group of friends gets trapped inside a retro video game and must beat all levels to escape.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.3,
    release_date: '2025-08-15',
    genre_ids: [16, 12, 35],
  },
];


const mockTvBase: TVShow[] = [
  {
    id: 2001,
    name: 'Dark Signals',
    overview: 'A team of investigators explores unexplained radio signals from deep space.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.5,
    first_air_date: '2024-09-10',
    genre_ids: [10765, 18],
  },
  {
    id: 2002,
    name: 'The Precinct',
    overview: 'An ensemble drama following officers in one of the busiest police precincts in the country.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.9,
    first_air_date: '2025-01-05',
    genre_ids: [80, 18],
  },
  {
    id: 2003,
    name: 'Rooftop Stories',
    overview: 'Six friends navigate love, careers, and city life from their shared rooftop in Brooklyn.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.4,
    first_air_date: '2025-03-18',
    genre_ids: [35, 18],
  },
  {
    id: 2004,
    name: 'Empire of Sand',
    overview: 'A historical epic following the rise and fall of rival desert kingdoms.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.7,
    first_air_date: '2024-11-20',
    genre_ids: [10768, 18],
  },
  {
    id: 2005,
    name: 'Byte',
    overview: 'A teenage hacker accidentally exposes a global surveillance program.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.1,
    first_air_date: '2025-02-28',
    genre_ids: [10759, 9648],
  },
  {
    id: 2006,
    name: 'Midnight Diner',
    overview: 'Each episode tells the story of a different customer at a late-night Tokyo eatery.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.3,
    first_air_date: '2024-08-01',
    genre_ids: [18],
  },
  {
    id: 2007,
    name: 'Wild Coast',
    overview: 'Marine biologists document endangered species along a remote Australian coastline.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.6,
    first_air_date: '2025-05-12',
    genre_ids: [18],
  },
  {
    id: 2008,
    name: 'Cold Trail',
    overview: 'A retired detective reopens unsolved cases that have haunted her for decades.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8.0,
    first_air_date: '2025-04-01',
    genre_ids: [80, 9648],
  },
];


const mockCast: CastMember[] = [
  { id: 3001, name: 'Alex Rivera', character: 'Commander Hayes', profile_path: null },
  { id: 3002, name: 'Priya Sharma', character: 'Dr. Meera Rao', profile_path: null },
  { id: 3003, name: 'James Cole', character: 'Agent Walker', profile_path: null },
  { id: 3004, name: 'Mei Lin', character: 'Captain Zhou', profile_path: null },
  { id: 3005, name: 'David Okafor', character: 'Marcus Bell', profile_path: null },
];

const mockCredits: Credits = { cast: mockCast, crew: [] };


export function buildMockMovieDetail(id: number): MovieDetails {
  const base = mockMovieBase.find((m) => m.id === id) ?? mockMovieBase[0];
  return {
    ...base,
    runtime: 128,
    genres: (base.genre_ids ?? []).map((gid) => MOCK_MOVIE_GENRES.find((g) => g.id === gid) ?? { id: gid, name: 'Unknown' }),
    tagline: 'Every story has an ending. This one has a beginning.',
    status: 'Released',
    credits: mockCredits,
    similar: paginate(mockMovieBase.filter((m) => m.id !== id).slice(0, 6)),
  };
}


const mockSeasons: Season[] = [
  { id: 4001, season_number: 1, name: 'Season 1', episode_count: 8, poster_path: null, air_date: '2024-09-10', overview: '' },
  { id: 4002, season_number: 2, name: 'Season 2', episode_count: 10, poster_path: null, air_date: '2025-09-10', overview: '' },
];

export function buildMockTvDetail(id: number): TVDetails {
  const base = mockTvBase.find((t) => t.id === id) ?? mockTvBase[0];
  return {
    ...base,
    genres: (base.genre_ids ?? []).map((gid) => MOCK_TV_GENRES.find((g) => g.id === gid) ?? { id: gid, name: 'Unknown' }),
    tagline: 'The truth is closer than you think.',
    status: 'Returning Series',
    number_of_seasons: 2,
    number_of_episodes: 18,
    episode_run_time: [45],
    seasons: mockSeasons,
    credits: mockCredits,
    similar: paginate(mockTvBase.filter((t) => t.id !== id).slice(0, 6)),
  };
}


export function buildMockSeasonDetail(seasonNumber: number): SeasonDetails {
  const count = seasonNumber === 1 ? 8 : 10;
  const episodes: Episode[] = Array.from({ length: count }, (_, i) => ({
    id: 5000 + seasonNumber * 100 + i,
    episode_number: i + 1,
    season_number: seasonNumber,
    name: `Episode ${i + 1}`,
    overview: `An exciting turn of events unfolds in episode ${i + 1}.`,
    still_path: null,
    runtime: 42 + (i % 5),
    air_date: '2024-09-17',
    vote_average: 7.5 + (i % 10) * 0.1,
  }));
  return { id: 4000 + seasonNumber, season_number: seasonNumber, name: `Season ${seasonNumber}`, episodes };
}


export function buildMockSearchResults(query: string): Paginated<MultiSearchItem> {
  const q = query.toLowerCase();
  const movieResults: MultiSearchItem[] = mockMovieBase
    .filter((m) => m.title.toLowerCase().includes(q))
    .map((m) => ({ id: m.id, media_type: 'movie' as const, title: m.title, poster_path: m.poster_path, vote_average: m.vote_average, release_date: m.release_date }));
  const tvResults: MultiSearchItem[] = mockTvBase
    .filter((t) => t.name.toLowerCase().includes(q))
    .map((t) => ({ id: t.id, media_type: 'tv' as const, name: t.name, poster_path: t.poster_path, vote_average: t.vote_average, first_air_date: t.first_air_date }));
  return paginate([...movieResults, ...tvResults]);
}


export function buildMockDiscoverMovies(genreId: number): Paginated<Movie> {
  const matches = mockMovieBase.filter((m) => m.genre_ids?.includes(genreId));
  return paginate(matches.length > 0 ? matches : mockMovieBase.slice(0, 4));
}

export function buildMockDiscoverTv(genreId: number): Paginated<TVShow> {
  const matches = mockTvBase.filter((t) => t.genre_ids?.includes(genreId));
  return paginate(matches.length > 0 ? matches : mockTvBase.slice(0, 4));
}


export const MOCK_TRENDING_MOVIES: Paginated<Movie> = paginate(mockMovieBase.slice(0, 6));
export const MOCK_POPULAR_MOVIES: Paginated<Movie> = paginate(mockMovieBase.slice(2, 8));
export const MOCK_TOP_RATED_MOVIES: Paginated<Movie> = paginate(mockMovieBase.filter((m) => m.vote_average >= 7.8));
export const MOCK_UPCOMING_MOVIES: Paginated<Movie> = paginate(mockMovieBase.slice(4));

export const MOCK_TRENDING_TV: Paginated<TVShow> = paginate(mockTvBase.slice(0, 5));
export const MOCK_POPULAR_TV: Paginated<TVShow> = paginate(mockTvBase.slice(2, 7));
export const MOCK_TOP_RATED_TV: Paginated<TVShow> = paginate(mockTvBase.filter((t) => t.vote_average >= 8.0));
export const MOCK_ON_AIR_TV: Paginated<TVShow> = paginate(mockTvBase.slice(3));


function paginate<T>(results: T[]): Paginated<T> {
  return { page: 1, results, total_pages: 1, total_results: results.length };
}
