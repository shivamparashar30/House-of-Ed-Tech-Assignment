import { useWatchlistStore, type WatchlistItem } from '@/stores/watchlist-store';

// Mock the remote API calls
jest.mock('@/api/watchlist-remote', () => ({
  watchlistRemote: {
    upsert: jest.fn(),
    remove: jest.fn(),
    fetchAll: jest.fn(),
  },
}));

const mockItem: WatchlistItem = {
  id: 123,
  media_type: 'movie',
  title: 'Inception',
  poster_path: '/inception.jpg',
  backdrop_path: '/inception-bg.jpg',
  vote_average: 8.4,
  release_date: '2010-07-16',
};

const mockItem2: WatchlistItem = {
  id: 456,
  media_type: 'tv',
  title: 'Breaking Bad',
  poster_path: '/bb.jpg',
  backdrop_path: '/bb-bg.jpg',
  vote_average: 9.5,
  release_date: '2008-01-20',
};

describe('useWatchlistStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useWatchlistStore.setState({ items: [] });
  });

  it('starts with empty items', () => {
    const { items } = useWatchlistStore.getState();
    expect(items).toEqual([]);
  });

  it('toggle adds item when not in watchlist', () => {
    useWatchlistStore.getState().toggle(mockItem);
    const { items } = useWatchlistStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(123);
  });

  it('toggle removes item when already in watchlist', () => {
    useWatchlistStore.getState().toggle(mockItem);
    expect(useWatchlistStore.getState().items).toHaveLength(1);

    useWatchlistStore.getState().toggle(mockItem);
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });

  it('adds new items to the beginning of the list', () => {
    useWatchlistStore.getState().toggle(mockItem);
    useWatchlistStore.getState().toggle(mockItem2);

    const { items } = useWatchlistStore.getState();
    expect(items[0].id).toBe(456); // Most recent first
    expect(items[1].id).toBe(123);
  });

  it('remove removes item by id', () => {
    useWatchlistStore.getState().toggle(mockItem);
    useWatchlistStore.getState().toggle(mockItem2);
    expect(useWatchlistStore.getState().items).toHaveLength(2);

    useWatchlistStore.getState().remove(123);
    const { items } = useWatchlistStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(456);
  });

  it('clear empties the watchlist', () => {
    useWatchlistStore.getState().toggle(mockItem);
    useWatchlistStore.getState().toggle(mockItem2);
    expect(useWatchlistStore.getState().items).toHaveLength(2);

    useWatchlistStore.getState().clear();
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });

  it('remove does nothing for non-existent id', () => {
    useWatchlistStore.getState().toggle(mockItem);
    useWatchlistStore.getState().remove(999);
    expect(useWatchlistStore.getState().items).toHaveLength(1);
  });
});
