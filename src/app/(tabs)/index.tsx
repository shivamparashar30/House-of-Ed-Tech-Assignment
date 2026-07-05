import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isTmdbConfigured } from '@/api/client';
import { FILTER_LABELS, HOME_TITLES } from '@/constants/strings';
import { ContinueWatchingRow } from '@/components/continue-watching-row';
import { EmptyState } from '@/components/empty-state';
import { GenreDropdown } from '@/components/genre-dropdown';
import { HeroBanner } from '@/components/hero-banner';
import { HomeFilterBar, type HomeSection } from '@/components/home-filter-bar';
import { MovieCarousel } from '@/components/movie-carousel';
import { NotificationBell } from '@/components/notification-bell';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useDiscoverMoviesByGenre, useDiscoverTvByGenre } from '@/hooks/use-discover';
import { useUnifiedGenres } from '@/hooks/use-genres';
import {
  usePopularMovies,
  useTopRatedMovies,
  useTrendingMovies,
  useUpcomingMovies,
} from '@/hooks/use-movies';
import { useOnTheAirTv, usePopularTv, useTopRatedTv, useTrendingTv } from '@/hooks/use-tv';
import { avatarUrl } from '@/lib/avatar';
import type { UnifiedGenre } from '@/lib/genres';
import { movieToHero, tvToCard, tvToHero } from '@/lib/media';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth-store';

const HERO_COUNT = 5;

export default function HomeScreen() {
  const Colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const avatarSeed =
    (user?.user_metadata?.display_name as string) || user?.email || 'BingeBox';
  const [section, setSection] = useState<HomeSection>('home');
  const [selectedGenre, setSelectedGenre] = useState<UnifiedGenre | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.resetQueries({ type: 'active' });
    setRefreshing(false);
  }, []);

  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const upcoming = useUpcomingMovies();

  const trendingTv = useTrendingTv();
  const popularTv = usePopularTv();
  const topRatedTv = useTopRatedTv();
  const onTheAirTv = useOnTheAirTv();

  const genres = useUnifiedGenres();
  const moviesGenreId = selectedGenre && section !== 'tv' ? selectedGenre.movieId : undefined;
  const tvGenreId = selectedGenre && section !== 'movies' ? selectedGenre.tvId : undefined;
  const genreMovies = useDiscoverMoviesByGenre(moviesGenreId);
  const genreTv = useDiscoverTvByGenre(tvGenreId);

  const movieHeroes = useMemo(
    () => trending.data?.results?.slice(0, HERO_COUNT).map(movieToHero),
    [trending.data],
  );

  const tvHeroes = useMemo(
    () => trendingTv.data?.results?.slice(0, HERO_COUNT).map(tvToHero),
    [trendingTv.data],
  );

  function toggleSection(next: HomeSection) {
    setSection((prev) => (prev === next ? 'home' : next));
    setSelectedGenre(null);
  }

  function handleSelectGenre(genre: UnifiedGenre) {
    setSelectedGenre(genre);
    setDropdownOpen(false);
  }

  if (!isTmdbConfigured) {
    return (
      <View className="flex-1 bg-background">
        <SafeAreaView edges={['top']} className="flex-1">
          <EmptyState
            icon="key-outline"
            title="Add your TMDB token"
            message="Set EXPO_PUBLIC_TMDB_ACCESS_TOKEN in your .env file (a free TMDB v4 read access token), then restart the dev server."
          />
        </SafeAreaView>
      </View>
    );
  }

  function renderContent() {
    if (selectedGenre) {
      return (
        <View className="pt-6">
          <Text className="px-5 pb-4 text-2xl font-extrabold text-foreground">{selectedGenre.name}</Text>
          {section !== 'tv' && (
            <MovieCarousel
              title={FILTER_LABELS.movies}
              movies={genreMovies.data?.results}
              isLoading={Boolean(moviesGenreId) && genreMovies.isLoading}
            />
          )}
          {section !== 'movies' && (
            <MovieCarousel
              title={FILTER_LABELS.tvShows}
              movies={genreTv.data?.results?.map(tvToCard)}
              isLoading={Boolean(tvGenreId) && genreTv.isLoading}
            />
          )}
        </View>
      );
    }

    if (section === 'movies') {
      return (
        <>
          <HeroBanner items={movieHeroes} isLoading={trending.isLoading} />
          <View className="pt-6">
            <ContinueWatchingRow />
            <MovieCarousel
              title={HOME_TITLES.trending}
              movies={trending.data?.results?.slice(HERO_COUNT)}
              isLoading={trending.isLoading}
            />
            <MovieCarousel title={HOME_TITLES.popular} movies={popular.data?.results} isLoading={popular.isLoading} />
            <MovieCarousel title={HOME_TITLES.topRated} movies={topRated.data?.results} isLoading={topRated.isLoading} />
            <MovieCarousel title={HOME_TITLES.upcoming} movies={upcoming.data?.results} isLoading={upcoming.isLoading} />
          </View>
        </>
      );
    }

    if (section === 'tv') {
      return (
        <>
          <HeroBanner items={tvHeroes} isLoading={trendingTv.isLoading} />
          <View className="pt-6">
            <ContinueWatchingRow />
            <MovieCarousel
              title={HOME_TITLES.trending}
              movies={trendingTv.data?.results?.slice(HERO_COUNT).map(tvToCard)}
              isLoading={trendingTv.isLoading}
            />
            <MovieCarousel title={HOME_TITLES.popular} movies={popularTv.data?.results?.map(tvToCard)} isLoading={popularTv.isLoading} />
            <MovieCarousel title={HOME_TITLES.topRated} movies={topRatedTv.data?.results?.map(tvToCard)} isLoading={topRatedTv.isLoading} />
            <MovieCarousel title={HOME_TITLES.onTheAir} movies={onTheAirTv.data?.results?.map(tvToCard)} isLoading={onTheAirTv.isLoading} />
          </View>
        </>
      );
    }

    return (
      <>
        <HeroBanner items={movieHeroes} isLoading={trending.isLoading} />
        <View className="pt-6">
          <ContinueWatchingRow />
          <MovieCarousel
            title={HOME_TITLES.trendingMovies}
            movies={trending.data?.results?.slice(HERO_COUNT)}
            isLoading={trending.isLoading}
          />
          <MovieCarousel title={HOME_TITLES.trendingShows} movies={trendingTv.data?.results?.map(tvToCard)} isLoading={trendingTv.isLoading} />
          <MovieCarousel title={HOME_TITLES.popularMovies} movies={popular.data?.results} isLoading={popular.isLoading} />
          <MovieCarousel title={HOME_TITLES.popularShows} movies={popularTv.data?.results?.map(tvToCard)} isLoading={popularTv.isLoading} />
          <MovieCarousel title={HOME_TITLES.topRatedMovies} movies={topRated.data?.results} isLoading={topRated.isLoading} />
          <MovieCarousel title={HOME_TITLES.topRatedShows} movies={topRatedTv.data?.results?.map(tvToCard)} isLoading={topRatedTv.isLoading} />
          <MovieCarousel title={HOME_TITLES.upcomingMovies} movies={upcoming.data?.results} isLoading={upcoming.isLoading} />
          <MovieCarousel title={HOME_TITLES.onTheAir} movies={onTheAirTv.data?.results?.map(tvToCard)} isLoading={onTheAirTv.isLoading} />
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView
        edges={['top']}
        className="z-10 bg-background"
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
        <View className="flex-row items-center gap-2 px-5 pt-2">
          <Ionicons name="film" size={22} color={Colors.primary} />
          <Text className="text-xl font-extrabold tracking-tight text-foreground">
            Binge<Text className="text-primary">Box</Text>
          </Text>
          <View className="flex-1" />
          <NotificationBell />
          <Pressable
            onPress={() => router.push('/account')}
            hitSlop={8}
            className="h-11 w-11 overflow-hidden rounded-xl bg-elevated active:opacity-70">
            <Image
              source={{ uri: avatarUrl(avatarSeed) }}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
            />
          </Pressable>
        </View>
        <HomeFilterBar
          section={section}
          selectedGenreName={selectedGenre?.name}
          onMovies={() => toggleSection('movies')}
          onTv={() => toggleSection('tv')}
          onCategories={() => setDropdownOpen(true)}
        />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }>
        {renderContent()}
      </ScrollView>

      <GenreDropdown
        visible={dropdownOpen}
        top={headerHeight - 6}
        genres={genres.data}
        isLoading={genres.isLoading}
        selectedName={selectedGenre?.name}
        onSelect={handleSelectGenre}
        onClose={() => setDropdownOpen(false)}
      />
    </View>
  );
}
