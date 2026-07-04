import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { PosterGrid } from '@/components/poster-grid';
import { Colors } from '@/constants/theme';
import { useCollectionsStore } from '@/stores/collections-store';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const collection = useCollectionsStore((state) => state.collections.find((c) => c.id === id));
  const renameCollection = useCollectionsStore((state) => state.renameCollection);
  const deleteCollection = useCollectionsStore((state) => state.deleteCollection);
  const removeItem = useCollectionsStore((state) => state.removeItem);

  const [renameOpen, setRenameOpen] = useState(false);

  if (!collection) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <EmptyState
          icon="albums-outline"
          title="Collection not found"
          message="This collection may have been deleted."
        />
      </SafeAreaView>
    );
  }

  function confirmDelete() {
    Alert.alert('Delete collection', `Delete “${collection?.name}”? This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (collection) deleteCollection(collection.id);
          router.back();
        },
      },
    ]);
  }

  const header = (
    <View className="flex-row items-center gap-2 px-1 pb-4 pt-2">
      <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
        <Ionicons name="chevron-back" size={26} color={Colors.text} />
      </Pressable>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-2xl font-extrabold text-white">
          {collection.name}
        </Text>
        <Text className="text-sm text-muted">
          {collection.items.length} {collection.items.length === 1 ? 'title' : 'titles'}
        </Text>
      </View>
      <Pressable onPress={() => setRenameOpen(true)} hitSlop={8} className="px-2 active:opacity-70">
        <Ionicons name="create-outline" size={22} color={Colors.text} />
      </Pressable>
      <Pressable onPress={confirmDelete} hitSlop={8} className="px-2 active:opacity-70">
        <Ionicons name="trash-outline" size={22} color={Colors.primary} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <PosterGrid
        movies={collection.items}
        onRemove={(mediaId) => removeItem(collection.id, mediaId)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="add-circle-outline"
            title="Nothing here yet"
            message="Open any movie or show and use “Add to collection” to fill this list."
          />
        }
      />

      <NamePromptModal
        visible={renameOpen}
        title="Rename collection"
        confirmLabel="Save"
        initialValue={collection.name}
        onSubmit={(name) => renameCollection(collection.id, name)}
        onClose={() => setRenameOpen(false)}
      />
    </SafeAreaView>
  );
}
