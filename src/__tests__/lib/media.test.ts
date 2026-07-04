import { movieToCard, tvToCard, multiToCards } from '@/lib/media';
import type { Movie, TVShow, MultiSearchItem } from '@/api/types';

const mockMovie: Movie = {
  id: 123,
  title: 'Inception',
  poster_path: '/inception.jpg',
  backdrop_path: '/inception-bg.jpg',
  vote_average: 8.4,
  release_date: '2010-07-16',
  overview: 'A mind-bending thriller',
  genres: [],
  runtime: 148,
  credits: { cast: [] },
  similar: { results: [] },
} as Movie;

const mockTvShow: TVShow = {
  id: 456,
  name: 'Breaking Bad',
  poster_path: '/bb.jpg',
  backdrop_path: '/bb-bg.jpg',
  vote_average: 9.5,
  first_air_date: '2008-01-20',
  overview: 'Chemistry teacher turns drug lord',
  genres: [],
  seasons: [],
  credits: { cast: [] },
  similar: { results: [] },
} as TVShow;

describe('movieToCard', () => {
  it('maps movie to card format', () => {
    const card = movieToCard(mockMovie);
    expect(card).toEqual({
      id: 123,
      title: 'Inception',
      poster_path: '/inception.jpg',
      vote_average: 8.4,
      release_date: '2010-07-16',
      media_type: 'movie',
    });
  });
});

describe('tvToCard', () => {
  it('maps TV show to card format using name and first_air_date', () => {
    const card = tvToCard(mockTvShow);
    expect(card).toEqual({
      id: 456,
      title: 'Breaking Bad',
      poster_path: '/bb.jpg',
      vote_average: 9.5,
      release_date: '2008-01-20',
      media_type: 'tv',
    });
  });
});

describe('multiToCards', () => {
  it('filters out items without poster_path', () => {
    const items: MultiSearchItem[] = [
      { id: 1, media_type: 'movie', title: 'A', poster_path: '/a.jpg', vote_average: 7, release_date: '2024-01-01' } as MultiSearchItem,
      { id: 2, media_type: 'movie', title: 'B', poster_path: null, vote_average: 6, release_date: '2024-01-01' } as MultiSearchItem,
    ];
    const cards = multiToCards(items);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe(1);
  });

  it('filters out non-movie/tv items (e.g. person)', () => {
    const items: MultiSearchItem[] = [
      { id: 1, media_type: 'person', name: 'Actor', poster_path: '/actor.jpg' } as MultiSearchItem,
      { id: 2, media_type: 'movie', title: 'Film', poster_path: '/film.jpg', vote_average: 5, release_date: '2024-01-01' } as MultiSearchItem,
    ];
    const cards = multiToCards(items);
    expect(cards).toHaveLength(1);
    expect(cards[0].media_type).toBe('movie');
  });

  it('uses name for TV shows and title for movies', () => {
    const items: MultiSearchItem[] = [
      { id: 1, media_type: 'tv', name: 'Show Name', poster_path: '/show.jpg', vote_average: 8, first_air_date: '2023-01-01' } as MultiSearchItem,
    ];
    const cards = multiToCards(items);
    expect(cards[0].title).toBe('Show Name');
  });

  it('returns empty array for empty input', () => {
    expect(multiToCards([])).toEqual([]);
  });
});
