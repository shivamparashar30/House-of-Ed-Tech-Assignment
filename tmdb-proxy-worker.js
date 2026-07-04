/**
 * BingeBox TMDB proxy — a free Cloudflare Worker that fronts TMDB so the app
 * works in regions where TMDB's own domains are blocked (e.g. some ISPs in India).
 *
 * It forwards two path prefixes:
 *   /3/...   -> https://api.themoviedb.org/3/...      (JSON API; Authorization passed through)
 *   /t/p/... -> https://image.tmdb.org/t/p/...        (poster / backdrop images)
 *
 * ── Deploy (one time) ───────────────────────────────────────────────────────
 *   1. npm install -g wrangler         # Cloudflare CLI
 *   2. wrangler login
 *   3. wrangler deploy tmdb-proxy-worker.js --name bingebox-tmdb --compatibility-date 2024-01-01
 *      (or paste this file into a new Worker at dash.cloudflare.com -> Workers)
 *   4. Copy the deployed URL, e.g. https://bingebox-tmdb.<you>.workers.dev
 *
 * ── Point the app at it (.env) ──────────────────────────────────────────────
 *   EXPO_PUBLIC_TMDB_API_BASE=https://bingebox-tmdb.<you>.workers.dev/3
 *   EXPO_PUBLIC_TMDB_IMAGE_BASE=https://bingebox-tmdb.<you>.workers.dev/t/p
 *   then restart: npx expo start -c
 *
 * The app still sends your TMDB token in the Authorization header; the Worker
 * just relays it, so no secrets live in the Worker.
 */

const API_ORIGIN = 'https://api.themoviedb.org';
const IMAGE_ORIGIN = 'https://image.tmdb.org';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Accept, Content-Type',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    let origin;
    if (url.pathname.startsWith('/3/')) {
      origin = API_ORIGIN;
    } else if (url.pathname.startsWith('/t/p/')) {
      origin = IMAGE_ORIGIN;
    } else {
      return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    }

    const target = origin + url.pathname + url.search;

    const upstream = await fetch(target, {
      method: 'GET',
      headers: {
        // Relay the caller's TMDB bearer token for API requests.
        Authorization: request.headers.get('Authorization') || '',
        Accept: 'application/json',
      },
    });

    const response = new Response(upstream.body, upstream);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  },
};
