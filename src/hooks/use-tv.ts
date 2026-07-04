import { useQuery } from '@tanstack/react-query';

import { queries } from '@/queries';

export function useTrendingTv() {
  return useQuery(queries.tv.trending);
}

export function usePopularTv() {
  return useQuery(queries.tv.popular);
}

export function useTopRatedTv() {
  return useQuery(queries.tv.topRated);
}

export function useOnTheAirTv() {
  return useQuery(queries.tv.onTheAir);
}

export function useTvDetail(id: number) {
  return useQuery({
    ...queries.tv.detail(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useTvSeason(id: number, seasonNumber: number) {
  return useQuery({
    ...queries.tv.season(id, seasonNumber),
    enabled: Number.isFinite(id) && id > 0 && seasonNumber >= 0,
  });
}
