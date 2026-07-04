import { memo } from 'react';
import { FlatList, View } from 'react-native';

import { MovieCard } from '@/components/movie-card';
import { CarouselSkeleton } from '@/components/skeleton';
import { SectionHeader } from '@/components/section-header';
import type { MediaCardItem } from '@/api/types';

const CARD_WIDTH = 124;

interface MovieCarouselProps {
  title: string;
  movies: MediaCardItem[] | undefined;
  isLoading: boolean;
}

export const MovieCarousel = memo(function MovieCarousel({ title, movies, isLoading }: MovieCarouselProps) {
  if (isLoading) {
    return (
      <View className="mb-7">
        <SectionHeader title={title} />
        <CarouselSkeleton cardWidth={CARD_WIDTH} />
      </View>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <View className="mb-7">
      <SectionHeader title={title} />
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        renderItem={({ item }) => <MovieCard movie={item} width={CARD_WIDTH} />}
      />
    </View>
  );
});
