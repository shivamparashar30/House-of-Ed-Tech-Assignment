import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { backdropUrl } from '@/api/client';
import { AddToCollectionSheet } from '@/components/add-to-collection-sheet';
import { CastList } from '@/components/cast-list';
import { EpisodeList } from '@/components/episode-list';
import { ErrorState } from '@/components/error-state';
import { GenrePills } from '@/components/genre-pills';
import { MovieCarousel } from '@/components/movie-carousel';
import { RatingBadge } from '@/components/rating-badge';
import { SeasonPicker } from '@/components/season-picker';
import { Colors, HeroGradient } from '@/constants/theme';
import { useTvDetail, useTvSeason } from '@/hooks/use-tv';
import { formatYear } from '@/lib/format';
import { tvToCard } from '@/lib/media';
import { useIsInAnyCollection } from '@/stores/collections-store';
import { getContinueItem, useContinueProgress } from '@/stores/continue-watching-store';
import { useIsInWatchlist, useWatchlistStore } from '@/stores/watchlist-store';

export default function TVDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const showId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: show, isLoading, isError, error, refetch } = useTvDetail(showId);
  const inWatchlist = useIsInWatchlist(showId);
  const toggleWatchlist = useWatchlistStore((state) => state.toggle);
  const continueItem = useContinueProgress(showId);
  const inCollection = useIsInAnyCollection(showId);
  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);

  const seasons = useMemo(
    () => (show?.seasons ?? []).filter((season) => season.episode_count > 0),
    [show],
  );
  const firstSeasonNumber = seasons.find((s) => s.season_number >= 1)?.season_number ?? 1;
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const activeSeason = selectedSeason ?? firstSeasonNumber;

  const season = useTvSeason(showId, activeSeason);

  const BackButton = (
    <Pressable
      onPress={() => router.back()}
      className="absolute left-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/60 active:opacity-70"
      style={{ top: insets.top + 8 }}>
      <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        {BackButton}
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (isError || !show) {
    return (
      <View className="flex-1 bg-background">
        {BackButton}
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </View>
    );
  }

  const backdrop = backdropUrl(show.backdrop_path) ?? backdropUrl(show.poster_path, 'w780');

  function handlePlay() {
    const resume = getContinueItem(showId);
    const playSeason = resume?.season ?? activeSeason;
    const playEpisode = resume?.episode ?? 1;
    router.push(`/player/${showId}?type=tv&season=${playSeason}&episode=${playEpisode}`);
  }

  return (
    <View className="flex-1 bg-background">
      {BackButton}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ height: 420 }}>
          {backdrop && (
            <Image source={{ uri: backdrop }} style={{ flex: 1 }} contentFit="cover" transition={300} />
          )}
          <LinearGradient colors={HeroGradient} style={{ position: 'absolute', inset: 0 }} />
        </View>

        <View className="-mt-20 gap-4 px-5">
          <Text className="text-3xl font-extrabold text-white">{show.name}</Text>

          {show.tagline ? (
            <Text className="-mt-2 text-sm italic text-muted">{show.tagline}</Text>
          ) : null}

          <View className="flex-row flex-wrap items-center gap-3">
            <RatingBadge voteAverage={show.vote_average} />
            <Text className="text-sm font-medium text-muted">{formatYear(show.first_air_date)}</Text>
            <Text className="text-sm font-medium text-muted">
              • {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
            </Text>
          </View>

          <GenrePills genres={show.genres} />

          <View className="flex-row gap-3">
            <Pressable
              onPress={handlePlay}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-80">
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text className="text-base font-bold text-white">
                {continueItem
                  ? `Resume S${continueItem.season ?? 1}:E${continueItem.episode ?? 1}`
                  : 'Play'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                toggleWatchlist({
                  id: show.id,
                  media_type: 'tv',
                  title: show.name,
                  poster_path: show.poster_path,
                  backdrop_path: show.backdrop_path,
                  vote_average: show.vote_average,
                  release_date: show.first_air_date,
                })
              }
              className="items-center justify-center rounded-xl bg-elevated px-4 py-3.5 active:opacity-70">
              <Ionicons
                name={inWatchlist ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={inWatchlist ? Colors.accent : Colors.text}
              />
            </Pressable>

            <Pressable
              onPress={() => setCollectionSheetOpen(true)}
              className="items-center justify-center rounded-xl bg-elevated px-4 py-3.5 active:opacity-70">
              <Ionicons
                name={inCollection ? 'checkmark' : 'add'}
                size={22}
                color={inCollection ? Colors.accent : Colors.text}
              />
            </Pressable>
          </View>

          {show.overview ? (
            <View className="gap-2">
              <Text className="text-lg font-bold text-white">Overview</Text>
              <Text className="text-sm leading-6 text-muted">{show.overview}</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-7 gap-4">
          <Text className="px-5 text-lg font-bold text-white">Episodes</Text>
          <SeasonPicker
            seasons={seasons}
            selectedSeason={activeSeason}
            onSelect={setSelectedSeason}
          />
          {season.isLoading ? (
            <View className="py-10">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <EpisodeList showId={showId} episodes={season.data?.episodes ?? []} />
          )}
        </View>

        <View className="mt-7">
          <CastList cast={show.credits.cast} />
          <MovieCarousel
            title="More Like This"
            movies={show.similar.results.map(tvToCard)}
            isLoading={false}
          />
        </View>
      </ScrollView>

      <AddToCollectionSheet
        visible={collectionSheetOpen}
        item={{
          id: show.id,
          media_type: 'tv',
          title: show.name,
          poster_path: show.poster_path,
          vote_average: show.vote_average,
          release_date: show.first_air_date,
        }}
        onClose={() => setCollectionSheetOpen(false)}
      />
    </View>
  );
}
