import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { ContinueWatchingCard } from '@/components/continue-watching-card';
import { SectionHeader } from '@/components/section-header';
import { useContinueWatchingStore } from '@/stores/continue-watching-store';

const CARD_WIDTH = 248;

export const ContinueWatchingRow = memo(function ContinueWatchingRow() {
  const items = useContinueWatchingStore((state) => state.items);
  const remove = useContinueWatchingStore((state) => state.remove);

  const handleRemove = useCallback(
    (id: number) => remove(id),
    [remove],
  );

  if (items.length === 0) return null;

  return (
    <View className="mb-7">
      <SectionHeader title="Continue Watching" />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
        renderItem={({ item }) => (
          <ContinueWatchingCard
            item={item}
            width={CARD_WIDTH}
            onRemove={() => handleRemove(item.id)}
          />
        )}
      />
    </View>
  );
});
