import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { posterUrl } from '@/api/client';
import { Colors } from '@/constants/theme';
import type { Collection } from '@/stores/collections-store';

interface CollectionTileProps {
  collection: Collection;
  width: number;
}

export const CollectionTile = memo(function CollectionTile({ collection, width }: CollectionTileProps) {
  const router = useRouter();
  const cover = posterUrl(collection.items[0]?.poster_path ?? null, 'w342');
  const count = collection.items.length;

  return (
    <Pressable
      onPress={() => router.push(`/collection/${collection.id}`)}
      className="active:opacity-80"
      style={{ width }}>
      <View
        className="items-center justify-center overflow-hidden rounded-2xl bg-elevated"
        style={{ aspectRatio: 16 / 10 }}>
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <Ionicons name="albums-outline" size={30} color={Colors.textSecondary} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View className="absolute inset-x-0 bottom-0 p-3">
          <Text numberOfLines={1} className="text-sm font-bold text-white">
            {collection.name}
          </Text>
          <Text className="text-xs text-muted">
            {count} {count === 1 ? 'title' : 'titles'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
