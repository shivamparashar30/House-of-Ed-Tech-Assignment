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
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
}

export function PosterGrid({
  movies,
  onRemove,
  ListHeaderComponent,
  ListEmptyComponent,
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
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
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
