# 🍿 BingeBox

A premium, dark-themed movie discovery app built with **Expo (SDK 56)**, **Expo
Router**, **NativeWind (Tailwind)**, **TanStack Query**, and **Zustand** — with an
OTT-style experience inspired by Netflix, Prime Video, and Disney+.

## Features

- **Home** — cinematic hero banner + horizontal carousels for Trending, Popular,
  Top Rated, and Upcoming movies.
- **Search** — debounced real-time search with a poster grid, plus empty,
  loading, and no-results states.
- **Movie Details** — backdrop, rating, release date, runtime, genres, overview,
  cast, similar movies, a Play button (Vidking player), and Add to Watchlist.
- **Watchlist** — persisted saved movies (AsyncStorage) with remove + empty state.

## Data sources

- **TMDB** — all discovery metadata (search, trending, details, cast, etc.).
- **Vidking** — embeddable video player (`vidking.net/embed/movie/{tmdbId}`),
  opened in a WebView from the Play button.

## Setup

1. **Use Node 20+** (this repo pins Node 22):
   ```bash
   nvm use
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Add your TMDB token.** Get a free **v4 Read Access Token** at
   <https://www.themoviedb.org/settings/api>, then edit `.env`:
   ```bash
   EXPO_PUBLIC_TMDB_ACCESS_TOKEN=eyJ...your_token...
   ```
   > Without this token the app runs but shows an "Add your TMDB token" screen.
4. **Run it:**
   ```bash
   npm run ios      # or: npm run android / npm run web
   ```
   > After changing `.env`, restart with a cleared cache: `npx expo start -c`.

## TMDB blocked in your region? (e.g. India)

Some ISPs block TMDB's domains. Two fixes:

- **Quick (local testing):** switch your device/emulator DNS to `1.1.1.1` or
  `8.8.8.8`, or use a VPN.
- **Proper fix:** deploy the included [`tmdb-proxy-worker.js`](./tmdb-proxy-worker.js)
  as a free Cloudflare Worker, then set these in `.env` (no code changes needed):
  ```bash
  EXPO_PUBLIC_TMDB_API_BASE=https://your-worker.workers.dev/3
  EXPO_PUBLIC_TMDB_IMAGE_BASE=https://your-worker.workers.dev/t/p
  ```
  Deploy steps are in the comment at the top of that file. Vidking playback is
  unaffected (it's keyed by TMDB id, which the proxy preserves).

## Project structure

See [`AGENTS.md`](./AGENTS.md) for the full architecture, conventions, and the
`src/` layout (`api/`, `queries/`, `hooks/`, `stores/`, `components/`, `lib/`).

## Scripts

```bash
npm run ios | android | web   # start on a platform
npm run lint                  # eslint
npx tsc --noEmit              # type-check
```
