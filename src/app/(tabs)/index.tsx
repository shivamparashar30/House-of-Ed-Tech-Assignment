import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isTmdbConfigured } from '@/api/client';
import { ContinueWatchingRow } from '@/components/continue-watching-row';
import { EmptyState } from '@/components/empty-state';
import { GenreDropdown } from '@/components/genre-dropdown';
import { HeroBanner } from '@/components/hero-banner';
import { HomeFilterBar, type HomeSection } from '@/components/home-filter-bar';
import { MovieCarousel } from '@/components/movie-carousel';
import { NotificationBell } from '@/components/notification-bell';
import { Colors } from '@/constants/theme';
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
          <Text className="px-5 pb-4 text-2xl font-extrabold text-white">{selectedGenre.name}</Text>
          {section !== 'tv' && (
            <MovieCarousel
              title="Movies"
              movies={genreMovies.data?.results}
              isLoading={Boolean(moviesGenreId) && genreMovies.isLoading}
            />
          )}
          {section !== 'movies' && (
            <MovieCarousel
              title="TV Shows"
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
              title="Trending"
              movies={trending.data?.results?.slice(HERO_COUNT)}
              isLoading={trending.isLoading}
            />
            <MovieCarousel title="Popular" movies={popular.data?.results} isLoading={popular.isLoading} />
            <MovieCarousel title="Top Rated" movies={topRated.data?.results} isLoading={topRated.isLoading} />
            <MovieCarousel title="Upcoming" movies={upcoming.data?.results} isLoading={upcoming.isLoading} />
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
              title="Trending"
              movies={trendingTv.data?.results?.slice(HERO_COUNT).map(tvToCard)}
              isLoading={trendingTv.isLoading}
            />
            <MovieCarousel title="Popular" movies={popularTv.data?.results?.map(tvToCard)} isLoading={popularTv.isLoading} />
            <MovieCarousel title="Top Rated" movies={topRatedTv.data?.results?.map(tvToCard)} isLoading={topRatedTv.isLoading} />
            <MovieCarousel title="On The Air" movies={onTheAirTv.data?.results?.map(tvToCard)} isLoading={onTheAirTv.isLoading} />
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
            title="Trending Movies"
            movies={trending.data?.results?.slice(HERO_COUNT)}
            isLoading={trending.isLoading}
          />
          <MovieCarousel title="Trending Shows" movies={trendingTv.data?.results?.map(tvToCard)} isLoading={trendingTv.isLoading} />
          <MovieCarousel title="Popular Movies" movies={popular.data?.results} isLoading={popular.isLoading} />
          <MovieCarousel title="Popular Shows" movies={popularTv.data?.results?.map(tvToCard)} isLoading={popularTv.isLoading} />
          <MovieCarousel title="Top Rated Movies" movies={topRated.data?.results} isLoading={topRated.isLoading} />
          <MovieCarousel title="Top Rated Shows" movies={topRatedTv.data?.results?.map(tvToCard)} isLoading={topRatedTv.isLoading} />
          <MovieCarousel title="Upcoming Movies" movies={upcoming.data?.results} isLoading={upcoming.isLoading} />
          <MovieCarousel title="On The Air" movies={onTheAirTv.data?.results?.map(tvToCard)} isLoading={onTheAirTv.isLoading} />
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
          <Text className="text-xl font-extrabold tracking-tight text-white">
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
