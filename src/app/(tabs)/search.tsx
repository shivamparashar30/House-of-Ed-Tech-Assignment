import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MediaCardItem } from '@/api/types';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { MediaListItem } from '@/components/media-list-item';
import { PosterGrid } from '@/components/poster-grid';
import { GridSkeleton, ListItemSkeleton } from '@/components/skeleton';
import { SearchBar } from '@/components/search-bar';
import { Colors } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTrendingMovies } from '@/hooks/use-movies';
import { useInfiniteSearchMulti, useSearchMulti } from '@/hooks/use-search';
import { useTrendingTv } from '@/hooks/use-tv';
import { relaxQuery, similarity } from '@/lib/fuzzy';
import { movieToCard, multiToCards, tvToCard } from '@/lib/media';

function RecommendationSkeleton() {
  return (
    <View className="gap-1 px-4 pt-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ListItemSkeleton key={i} />
      ))}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text className="px-1 pb-4 text-lg font-bold text-white">{title}</Text>;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 400);
  const trimmed = debouncedQuery.trim();
  const isSearching = trimmed.length > 0;

  const {
    data: infiniteData,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchMulti(trimmed);

  const exactResults = useMemo(
    () => multiToCards(infiniteData?.pages.flatMap((p) => p.results) ?? []),
    [infiniteData],
  );

  const needsFallback = isSearching && !isLoading && exactResults.length === 0;
  const fallbackQuery = needsFallback ? relaxQuery(trimmed) : '';
  const fallback = useSearchMulti(fallbackQuery);

  const results = useMemo(() => {
    if (exactResults.length > 0) return exactResults;
    const fuzzy = multiToCards(fallback.data?.results ?? []);
    return [...fuzzy].sort((a, b) => similarity(trimmed, b.title) - similarity(trimmed, a.title));
  }, [exactResults, fallback.data, trimmed]);

  const searchLoading = isLoading || (needsFallback && Boolean(fallbackQuery) && fallback.isLoading);

  const trendingMovies = useTrendingMovies();
  const trendingTv = useTrendingTv();
  const recommendations = useMemo(() => {
    const movies = (trendingMovies.data?.results ?? []).map(movieToCard);
    const shows = (trendingTv.data?.results ?? []).map(tvToCard);
    const merged: MediaCardItem[] = [];
    const max = Math.max(movies.length, shows.length);
    for (let i = 0; i < max; i += 1) {
      if (movies[i]) merged.push(movies[i]);
      if (shows[i]) merged.push(shows[i]);
    }
    return merged;
  }, [trendingMovies.data, trendingTv.data]);
  const recommendationsLoading = trendingMovies.isLoading || trendingTv.isLoading;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function renderContent() {
    if (!isSearching) {
      if (recommendationsLoading) return <RecommendationSkeleton />;
      return (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={<SectionTitle title="Recommended Shows & Movies" />}
          renderItem={({ item }) => <MediaListItem item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                trendingMovies.refetch();
                trendingTv.refetch();
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      );
    }

    if (searchLoading) return <GridSkeleton />;

    if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

    if (results.length === 0) {
      return (
        <EmptyState
          icon="sad-outline"
          title="No results found"
          message={`We couldn't find anything matching "${trimmed}".`}
        />
      );
    }

    return (
      <PosterGrid
        movies={results}
        onEndReached={handleEndReached}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : undefined
        }
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pb-3 pt-2">
        <Text className="mb-4 text-2xl font-extrabold text-white">Search</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Movies, shows, genres" />
      </View>
      <View className="flex-1">{renderContent()}</View>
    </SafeAreaView>
  );
}
