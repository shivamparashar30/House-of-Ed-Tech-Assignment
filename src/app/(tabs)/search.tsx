import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MediaCardItem } from '@/api/types';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { MediaListItem } from '@/components/media-list-item';
import { PosterGrid } from '@/components/poster-grid';
import { SearchBar } from '@/components/search-bar';
import { Colors } from '@/constants/theme';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTrendingMovies } from '@/hooks/use-movies';
import { useSearchMulti } from '@/hooks/use-search';
import { useTrendingTv } from '@/hooks/use-tv';
import { relaxQuery, similarity } from '@/lib/fuzzy';
import { movieToCard, multiToCards, tvToCard } from '@/lib/media';

function Spinner() {
  return (
    <View className="items-center justify-center py-24">
      <ActivityIndicator color={Colors.primary} />
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

  const { data, isLoading, isError, error, refetch } = useSearchMulti(trimmed);
  const exactResults = useMemo(() => multiToCards(data?.results ?? []), [data]);

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

  function renderContent() {
    if (!isSearching) {
      if (recommendationsLoading) return <Spinner />;
      return (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => `${item.media_type}-${item.id}`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={<SectionTitle title="Recommended Shows & Movies" />}
          renderItem={({ item }) => <MediaListItem item={item} />}
        />
      );
    }

    if (searchLoading) return <Spinner />;

    if (isError) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

    if (results.length === 0) {
      return (
        <EmptyState
          icon="sad-outline"
          title="No results found"
          message={`We couldn’t find anything matching “${trimmed}”.`}
        />
      );
    }

    return <PosterGrid movies={results} />;
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
