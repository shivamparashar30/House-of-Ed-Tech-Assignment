/**
 * Centralized UI text constants.
 * Keeps screen components data-driven and makes future i18n feasible.
 */

// App-wide
export const APP_NAME = 'BingeBox';

export const HOME_TITLES = {
  trending: 'Trending',
  popular: 'Popular',
  topRated: 'Top Rated',
  upcoming: 'Upcoming',
  trendingMovies: 'Trending Movies',
  popularMovies: 'Popular Movies',
  topRatedMovies: 'Top Rated Movies',
  upcomingMovies: 'Upcoming Movies',
  trendingShows: 'Trending Shows',
  popularShows: 'Popular Shows',
  topRatedShows: 'Top Rated Shows',
  onTheAir: 'On The Air',
} as const;

export const FILTER_LABELS = {
  movies: 'Movies',
  tvShows: 'TV Shows',
  categories: 'Categories',
} as const;

export const SEARCH = {
  placeholder: 'Movies, shows, genres',
  recommended: 'Recommended Shows & Movies',
  noResults: (query: string) => `We couldn't find anything matching "${query}".`,
  noResultsHint: 'Try adjusting your search or check for typos.',
} as const;

export const LIBRARY = {
  title: 'My Library',
  watchlist: 'Watchlist',
  collections: 'Collections',
  newCollection: 'New',
  collectionsHint:
    'Create collections like "Horror night" or "Comedy" and add any movie or show.',
  emptyWatchlist: 'Your watchlist is empty',
  emptyWatchlistHint: 'Bookmark movies and shows to find them here.',
} as const;

export const DETAIL = {
  overview: 'Overview',
  moreLikeThis: 'More Like This',
  episodes: 'Episodes',
  play: 'Play',
  resume: 'Resume',
} as const;

export const CONTINUE_WATCHING = {
  title: 'Continue Watching',
} as const;

export const ACCOUNT = {
  title: 'Profile',
  statWatchlist: 'Watchlist',
  statCollections: 'Collections',
  statWatching: 'Watching',
  sectionAppearance: 'Appearance',
  sectionLibrary: 'Library',
  sectionAccount: 'Account',
  sectionAbout: 'About',
  myWatchlist: 'My Watchlist',
  myCollections: 'My Collections',
  subscription: 'Subscription',
  notifications: 'Notifications',
  appVersion: 'App Version',
  signOut: 'Sign Out',
  darkMode: 'Dark Mode',
} as const;

export const PAYWALL = {
  goPremium: 'Go Premium',
  subtitle: 'Subscribe to unlock the full BingeBox experience.',
  subscribe: 'Subscribe',
  notNow: 'Not now?',
  signOut: 'Sign out',
  premiumActive: 'Premium Active',
  premiumSubtitle: 'You have full access to BingeBox',
  planLabel: 'Plan',
  priceLabel: 'Price',
  statusLabel: 'Status',
  renewsOn: 'Renews on',
  yourBenefits: 'Your benefits',
} as const;

export const PLAN_BENEFITS = [
  'Unlimited streaming, ad-free',
  'Full HD playback on every title',
  'Watchlist & collections synced to your account',
  'Resume across all your devices',
] as const;

export const NOTIFICATIONS = {
  title: 'Notifications',
  clear: 'Clear',
  emptyTitle: 'No notifications yet',
  emptyMessage: 'Updates and alerts from BingeBox will show up here.',
  paymentSuccess: {
    title: 'Welcome to Premium! 🎉',
    body: 'Enjoy unlimited movies & shows, ad-free in full HD. Your binge starts now!',
  },
} as const;

export const AUTH = {
  prompt: 'Please enter your email and password.',
  signupSuccess: 'Account created. Check your email to confirm, then sign in.',
  defaultName: 'BingeBox User',
} as const;

export const ERROR = {
  defaultTitle: 'Something went wrong',
  defaultMessage: "We couldn't load this content. Please try again.",
  retry: 'Retry',
  playerFailed: 'This title could not be played right now.',
} as const;

export const CHECKOUT = {
  title: 'Complete payment',
} as const;
