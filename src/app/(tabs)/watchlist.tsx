import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollectionTile } from '@/components/collection-tile';
import { EmptyState } from '@/components/empty-state';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { PosterGrid } from '@/components/poster-grid';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useCollectionsStore } from '@/stores/collections-store';
import { useWatchlistStore } from '@/stores/watchlist-store';

const TILE_WIDTH = 168;

export default function LibraryScreen() {
  const Colors = useThemeColors();
  const items = useWatchlistStore((state) => state.items);
  const removeFromWatchlist = useWatchlistStore((state) => state.remove);
  const collections = useCollectionsStore((state) => state.collections);
  const createCollection = useCollectionsStore((state) => state.createCollection);

  const [createOpen, setCreateOpen] = useState(false);

  const header = (
    <View className="pb-2">
      <Text className="px-1 pb-5 pt-2 text-2xl font-extrabold text-foreground">My Library</Text>

      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text className="text-lg font-bold text-foreground">Collections</Text>
        <Pressable
          onPress={() => setCreateOpen(true)}
          className="flex-row items-center gap-1 rounded-full bg-elevated px-3 py-1.5 active:opacity-80">
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text className="text-sm font-semibold text-foreground">New</Text>
        </Pressable>
      </View>

      {collections.length === 0 ? (
        <Pressable
          onPress={() => setCreateOpen(true)}
          className="mb-6 flex-row items-center gap-3 rounded-2xl border border-dashed border-[#333] bg-elevated/40 px-4 py-5 active:opacity-80">
          <Ionicons name="albums-outline" size={22} color={Colors.textSecondary} />
          <Text className="flex-1 text-sm text-muted">
            Create collections like “Horror night” or “Comedy” and add any movie or show.
          </Text>
        </Pressable>
      ) : (
        <FlatList
          horizontal
          data={collections}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 24, paddingRight: 4 }}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          renderItem={({ item }) => <CollectionTile collection={item} width={TILE_WIDTH} />}
        />
      )}

      <Text className="mb-1 px-1 text-lg font-bold text-foreground">Watchlist</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PosterGrid
        movies={items}
        onRemove={removeFromWatchlist}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="Your watchlist is empty"
            message="Tap the bookmark on any movie or show to save it here."
          />
        }
      />

      <NamePromptModal
        visible={createOpen}
        title="New collection"
        confirmLabel="Create"
        onSubmit={(name) => createCollection(name)}
        onClose={() => setCreateOpen(false)}
      />
    </SafeAreaView>
  );
}
