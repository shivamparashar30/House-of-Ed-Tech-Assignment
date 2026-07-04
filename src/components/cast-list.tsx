import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { profileUrl } from '@/api/client';
import type { CastMember } from '@/api/types';
import { SectionHeader } from '@/components/section-header';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface CastListProps {
  cast: CastMember[];
}

const CastItem = memo(function CastItem({ item, index }: { item: CastMember; index: number }) {
  const Colors = useThemeColors();
  const uri = profileUrl(item.profile_path);
  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(350).springify()} style={{ width: 80 }} className="items-center gap-1.5">
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-elevated">
        {uri ? (
          <Image source={{ uri }} style={{ width: 80, height: 80 }} contentFit="cover" transition={200} />
        ) : (
          <Ionicons name="person" size={28} color={Colors.textSecondary} />
        )}
      </View>
      <Text numberOfLines={1} className="text-center text-xs font-semibold text-foreground">
        {item.name}
      </Text>
      <Text numberOfLines={1} className="text-center text-[11px] text-muted">
        {item.character}
      </Text>
    </Animated.View>
  );
});

export const CastList = memo(function CastList({ cast }: CastListProps) {
  const topCast = cast.slice(0, 15);
  if (topCast.length === 0) return null;

  return (
    <View className="mb-7">
      <SectionHeader title="Cast" />
      <FlatList
        horizontal
        data={topCast}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={5}
        renderItem={({ item, index }) => <CastItem item={item} index={index} />}
      />
    </View>
  );
});
