import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { backdropUrl } from '@/api/client';
import { AddToCollectionSheet } from '@/components/add-to-collection-sheet';
import { CastList } from '@/components/cast-list';
import { ErrorState } from '@/components/error-state';
import { GenrePills } from '@/components/genre-pills';
import { MovieCarousel } from '@/components/movie-carousel';
import { RatingBadge } from '@/components/rating-badge';
import { Colors, HeroGradient } from '@/constants/theme';
import { useMovieDetail } from '@/hooks/use-movies';
import { formatReleaseDate, formatRuntime } from '@/lib/format';
import { useIsInAnyCollection } from '@/stores/collections-store';
import { useContinueProgress } from '@/stores/continue-watching-store';
import { useIsInWatchlist, useWatchlistStore } from '@/stores/watchlist-store';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Number(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: movie, isLoading, isError, error, refetch } = useMovieDetail(movieId);
  const inWatchlist = useIsInWatchlist(movieId);
  const toggleWatchlist = useWatchlistStore((state) => state.toggle);
  const continueItem = useContinueProgress(movieId);
  const inCollection = useIsInAnyCollection(movieId);
  const [collectionSheetOpen, setCollectionSheetOpen] = useState(false);

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

  if (isError || !movie) {
    return (
      <View className="flex-1 bg-background">
        {BackButton}
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      </View>
    );
  }

  const backdrop = backdropUrl(movie.backdrop_path) ?? backdropUrl(movie.poster_path, 'w780');
  const runtime = formatRuntime(movie.runtime);

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
          <Text className="text-3xl font-extrabold text-white">{movie.title}</Text>

          {movie.tagline ? (
            <Text className="-mt-2 text-sm italic text-muted">{movie.tagline}</Text>
          ) : null}

          <View className="flex-row flex-wrap items-center gap-3">
            <RatingBadge voteAverage={movie.vote_average} />
            <Text className="text-sm font-medium text-muted">
              {formatReleaseDate(movie.release_date)}
            </Text>
            {runtime ? <Text className="text-sm font-medium text-muted">• {runtime}</Text> : null}
          </View>

          <GenrePills genres={movie.genres} />

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push(`/player/${movie.id}`)}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-80">
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text className="text-base font-bold text-white">
                {continueItem ? 'Resume' : 'Play'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                toggleWatchlist({
                  id: movie.id,
                  media_type: 'movie',
                  title: movie.title,
                  poster_path: movie.poster_path,
                  backdrop_path: movie.backdrop_path,
                  vote_average: movie.vote_average,
                  release_date: movie.release_date,
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

          {movie.overview ? (
            <View className="gap-2">
              <Text className="text-lg font-bold text-white">Overview</Text>
              <Text className="text-sm leading-6 text-muted">{movie.overview}</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-7">
          <CastList cast={movie.credits.cast} />
          <MovieCarousel title="More Like This" movies={movie.similar.results} isLoading={false} />
        </View>
      </ScrollView>

      <AddToCollectionSheet
        visible={collectionSheetOpen}
        item={{
          id: movie.id,
          media_type: 'movie',
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        }}
        onClose={() => setCollectionSheetOpen(false)}
      />
    </View>
  );
}
