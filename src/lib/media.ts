import type { HeroMedia, MediaCardItem, Movie, MultiSearchItem, TVShow } from '@/api/types';

export function movieToHero(movie: Movie): HeroMedia {
  return {
    id: movie.id,
    title: movie.title,
    backdrop_path: movie.backdrop_path,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    media_type: 'movie',
  };
}

export function tvToHero(show: TVShow): HeroMedia {
  return {
    id: show.id,
    title: show.name,
    backdrop_path: show.backdrop_path,
    poster_path: show.poster_path,
    vote_average: show.vote_average,
    release_date: show.first_air_date,
    media_type: 'tv',
  };
}

export function movieToCard(movie: Movie): MediaCardItem {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    media_type: 'movie',
  };
}

export function tvToCard(show: TVShow): MediaCardItem {
  return {
    id: show.id,
    title: show.name,
    poster_path: show.poster_path,
    vote_average: show.vote_average,
    release_date: show.first_air_date,
    media_type: 'tv',
  };
}

export function multiToCards(results: MultiSearchItem[]): MediaCardItem[] {
  return results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .filter((item) => item.poster_path)
    .map((item) => ({
      id: item.id,
      title: item.title ?? item.name ?? '',
      poster_path: item.poster_path,
      vote_average: item.vote_average ?? 0,
      release_date: item.release_date ?? item.first_air_date ?? '',
      media_type: item.media_type as 'movie' | 'tv',
    }));
}
