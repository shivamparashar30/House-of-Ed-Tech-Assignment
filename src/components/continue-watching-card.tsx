import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { type DimensionValue, Pressable, Text, View } from 'react-native';
import Animated, { type WithSpringConfig, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { backdropUrl, posterUrl } from '@/api/client';
import { useThemeColors } from '@/hooks/use-theme-colors';
import type { ContinueWatchingItem } from '@/stores/continue-watching-store';

const PRESS_SPRING: WithSpringConfig = { damping: 15, stiffness: 300 };

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
  width: number;
  onRemove: () => void;
}

export const ContinueWatchingCard = memo(function ContinueWatchingCard({ item, width, onRemove }: ContinueWatchingCardProps) {
  const Colors = useThemeColors();
  const router = useRouter();
  const uri = backdropUrl(item.backdrop_path, 'w780') ?? posterUrl(item.poster_path);
  const progressPercent = `${Math.min(100, Math.round(item.progress * 100))}%` as DimensionValue;

  const isTv = item.media_type === 'tv';
  const subtitle = isTv ? `S${item.season ?? 1}:E${item.episode ?? 1}` : null;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width }, animatedStyle]}>
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95, PRESS_SPRING); }}
      onPressOut={() => { scale.value = withSpring(1, PRESS_SPRING); }}
      accessibilityLabel={`Continue watching ${item.title}`}
      accessibilityRole="button"
      onPress={() =>
        router.push(
          isTv
            ? `/player/${item.id}?type=tv&season=${item.season ?? 1}&episode=${item.episode ?? 1}`
            : `/player/${item.id}`,
        )
      }
      className="active:opacity-80">
      <View
        className="overflow-hidden rounded-xl bg-elevated"
        style={{ aspectRatio: 16 / 9 }}>
        {uri ? (
          <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={200} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="film-outline" size={28} color={Colors.textSecondary} />
          </View>
        )}

        <View className="absolute inset-0 items-center justify-center">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-black/55">
            <Ionicons name="play" size={22} color="#FFFFFF" />
          </View>
        </View>

        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/70 active:opacity-70">
          <Ionicons name="close" size={15} color="#FFFFFF" />
        </Pressable>

        <View className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
          <View className="h-full bg-primary" style={{ width: progressPercent }} />
        </View>
      </View>

      <Text numberOfLines={1} className="mt-2 text-sm font-semibold text-foreground">
        {item.title}
      </Text>
      {subtitle ? <Text className="text-xs text-muted">{subtitle}</Text> : null}
    </Pressable>
    </Animated.View>
  );
});
