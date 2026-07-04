import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { posterUrl } from '@/api/client';
import type { MediaCardItem } from '@/api/types';
import { RatingBadge } from '@/components/rating-badge';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { formatYear } from '@/lib/format';

interface MovieCardProps {
  movie: MediaCardItem;
  width: number;
  showMeta?: boolean;
  onRemove?: () => void;
}

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

export const MovieCard = memo(function MovieCard({ movie, width, showMeta = false, onRemove }: MovieCardProps) {
  const router = useRouter();
  const Colors = useThemeColors();
  const uri = posterUrl(movie.poster_path);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_CONFIG);
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  return (
    <Pressable
      onPress={() =>
        router.push(movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`)
      }
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ width }}>
      <Animated.View style={animatedStyle}>
        <View
          className="overflow-hidden rounded-2xl bg-elevated"
          style={{
            aspectRatio: 2 / 3,
            shadowColor: '#000',
            shadowOpacity: 0.5,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}>
          {uri ? (
            <Image source={{ uri }} style={{ flex: 1 }} contentFit="cover" transition={200} />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="film-outline" size={32} color={Colors.textSecondary} />
            </View>
          )}
          <View className="absolute left-1.5 top-1.5">
            <RatingBadge voteAverage={movie.vote_average} />
          </View>

          {onRemove && (
            <Pressable
              onPress={onRemove}
              hitSlop={8}
              className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-black/70 active:opacity-70">
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        {showMeta && (
          <View className="mt-2 gap-0.5">
            <Text numberOfLines={1} className="text-sm font-semibold text-foreground">
              {movie.title}
            </Text>
            <Text className="text-xs text-muted">{formatYear(movie.release_date) || '—'}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});
