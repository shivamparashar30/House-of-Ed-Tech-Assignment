import { type ReactElement } from 'react';
import { FlatList, useWindowDimensions } from 'react-native';

import { MovieCard } from '@/components/movie-card';
import type { MediaCardItem } from '@/api/types';

const COLUMNS = 3;
const H_PADDING = 16;
const GAP = 12;

interface PosterGridProps {
  movies: MediaCardItem[];
  onRemove?: (id: number) => void;
  onEndReached?: () => void;
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
  ListFooterComponent?: ReactElement;
}

export function PosterGrid({
  movies,
  onRemove,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
}: PosterGridProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      numColumns={COLUMNS}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      columnWrapperStyle={{ gap: GAP }}
      contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: 32, gap: GAP }}
      initialNumToRender={9}
      maxToRenderPerBatch={9}
      windowSize={5}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={ListFooterComponent}
      renderItem={({ item }) => (
        <MovieCard
          movie={item}
          width={cardWidth}
          showMeta
          onRemove={onRemove ? () => onRemove(item.id) : undefined}
        />
      )}
    />
  );
}
