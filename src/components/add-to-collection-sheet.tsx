import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { type CollectionItem, useCollectionsStore } from '@/stores/collections-store';

interface AddToCollectionSheetProps {
  visible: boolean;
  item: CollectionItem | null;
  onClose: () => void;
}

export function AddToCollectionSheet({ visible, item, onClose }: AddToCollectionSheetProps) {
  const Colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const collections = useCollectionsStore((state) => state.collections);
  const addItem = useCollectionsStore((state) => state.addItem);
  const removeItem = useCollectionsStore((state) => state.removeItem);
  const createCollection = useCollectionsStore((state) => state.createCollection);

  const [createOpen, setCreateOpen] = useState(false);

  function toggle(collectionId: string, contains: boolean) {
    if (!item) return;
    if (contains) removeItem(collectionId, item.id);
    else addItem(collectionId, item);
    onClose();
  }

  function handleCreate(name: string) {
    const id = createCollection(name);
    if (item) addItem(id, item);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/70" onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="rounded-t-3xl bg-surface"
          style={{ paddingBottom: insets.bottom + 12, maxHeight: '75%' }}>
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-lg font-bold text-foreground">Add to collection</Text>
            <Pressable onPress={onClose} hitSlop={8} className="active:opacity-70">
              <Ionicons name="close" size={22} color={Colors.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setCreateOpen(true)}
            className="flex-row items-center gap-3 px-5 py-3.5 active:bg-elevated">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
            <Text className="text-base font-semibold text-foreground">New collection</Text>
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {collections.map((collection) => {
              const contains = Boolean(item && collection.items.some((i) => i.id === item.id));
              return (
                <Pressable
                  key={collection.id}
                  onPress={() => toggle(collection.id, contains)}
                  className="flex-row items-center justify-between px-5 py-3.5 active:bg-elevated">
                  <View className="flex-1">
                    <Text numberOfLines={1} className="text-base font-medium text-foreground">
                      {collection.name}
                    </Text>
                    <Text className="text-xs text-muted">
                      {collection.items.length} {collection.items.length === 1 ? 'title' : 'titles'}
                    </Text>
                  </View>
                  <Ionicons
                    name={contains ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={contains ? Colors.primary : Colors.textSecondary}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>

      <NamePromptModal
        visible={createOpen}
        title="New collection"
        confirmLabel="Create"
        onSubmit={handleCreate}
        onClose={() => setCreateOpen(false)}
      />
    </Modal>
  );
}
