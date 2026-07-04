import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View, type ViewToken, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { backdropUrl } from '@/api/client';
import type { HeroMedia } from '@/api/types';
import { RatingBadge } from '@/components/rating-badge';
import { Skeleton } from '@/components/skeleton';
import { useHeroGradient, useThemeColors } from '@/hooks/use-theme-colors';
import { useFreeTierGuard } from '@/hooks/use-free-tier-guard';
import { formatYear } from '@/lib/format';

interface HeroBannerProps {
  items: HeroMedia[] | undefined;
  isLoading: boolean;
}

const HeroCard = memo(function HeroCard({
  media,
  width,
  height,
  gradient,
}: {
  media: HeroMedia;
  width: number;
  height: number;
  gradient: readonly string[];
}) {
  const router = useRouter();
  const { tryPlay } = useFreeTierGuard();
  const uri = backdropUrl(media.backdrop_path) ?? backdropUrl(media.poster_path, 'w780');
  const isTv = media.media_type === 'tv';

  return (
    <View style={{ width, height }}>
      {uri && (
        <Image source={{ uri }} style={{ width, height }} contentFit="cover" transition={300} />
      )}

      <LinearGradient colors={gradient as [string, string, ...string[]]} style={{ position: 'absolute', inset: 0 }} />

      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        className="absolute inset-x-0 bottom-0 items-center gap-3 px-6 pb-6">
        <Text className="text-center text-3xl font-extrabold text-white" numberOfLines={2}>
          {media.title}
        </Text>

        <View className="flex-row items-center gap-3">
          <RatingBadge voteAverage={media.vote_average} />
          <Text className="text-sm font-medium text-muted">{formatYear(media.release_date)}</Text>
        </View>

        <View className="mt-1 flex-row gap-3">
          <Pressable
            onPress={() =>
              tryPlay(media.id, () =>
                router.push(
                  isTv ? `/player/${media.id}?type=tv&season=1&episode=1` : `/player/${media.id}`,
                ),
              )
            }
            className="flex-row items-center gap-2 rounded-xl bg-primary px-6 py-3 active:opacity-80">
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text className="text-base font-bold text-white">Play</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(isTv ? `/tv/${media.id}` : `/movie/${media.id}`)}
            className="flex-row items-center gap-2 rounded-xl bg-white/15 px-6 py-3 active:opacity-70">
            <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" />
            <Text className="text-base font-bold text-white">Info</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
});

const AUTO_SCROLL_INTERVAL = 2000;

export function HeroBanner({ items, isLoading }: HeroBannerProps) {
  const Colors = useThemeColors();
  const heroGradient = useHeroGradient();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<HeroMedia>>(null);
  const activeIndexRef = useRef(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        activeIndexRef.current = viewableItems[0].index;
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  const height = Math.round(width * 1.25);

  const renderItem = useCallback(
    ({ item }: { item: HeroMedia }) => (
      <HeroCard media={item} width={width} height={height} gradient={heroGradient} />
    ),
    [width, height, heroGradient],
  );

  useEffect(() => {
    if (!items || items.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % items.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [items]);

  if (isLoading || !items || items.length === 0) {
    return (
      <View style={{ width, height }} className="bg-elevated">
        <Skeleton width="100%" height="100%" radius={0} />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        data={items}
        keyExtractor={(item) => `hero-${item.id}`}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />
      {items.length > 1 && (
        <View className="absolute bottom-2 flex-row self-center gap-1.5">
          {items.map((item, index) => (
            <View
              key={item.id}
              className="h-1.5 rounded-full"
              style={{
                width: index === activeIndex ? 18 : 6,
                backgroundColor: index === activeIndex ? Colors.primary : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
