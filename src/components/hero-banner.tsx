import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { backdropUrl } from '@/api/client';
import type { HeroMedia } from '@/api/types';
import { RatingBadge } from '@/components/rating-badge';
import { Skeleton } from '@/components/skeleton';
import { Colors, HeroGradient } from '@/constants/theme';
import { formatYear } from '@/lib/format';

interface HeroBannerProps {
  media: HeroMedia | undefined;
  isLoading: boolean;
}

export function HeroBanner({ media, isLoading }: HeroBannerProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const height = Math.round(width * 1.25);

  if (isLoading || !media) {
    return (
      <View style={{ width, height }} className="bg-elevated">
        <Skeleton width="100%" height="100%" radius={0} />
      </View>
    );
  }

  const uri = backdropUrl(media.backdrop_path) ?? backdropUrl(media.poster_path, 'w780');
  const isTv = media.media_type === 'tv';

  return (
    <View style={{ width, height }}>
      {uri && (
        <Image source={{ uri }} style={{ width, height }} contentFit="cover" transition={300} />
      )}

      <LinearGradient colors={HeroGradient} style={{ position: 'absolute', inset: 0 }} />

      <View className="absolute inset-x-0 bottom-0 items-center gap-3 px-6 pb-6">
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
              router.push(
                isTv ? `/player/${media.id}?type=tv&season=1&episode=1` : `/player/${media.id}`,
              )
            }
            className="flex-row items-center gap-2 rounded-xl bg-primary px-6 py-3 active:opacity-80">
            <Ionicons name="play" size={18} color="#FFFFFF" />
            <Text className="text-base font-bold text-white">Play</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push(isTv ? `/tv/${media.id}` : `/movie/${media.id}`)}
            className="flex-row items-center gap-2 rounded-xl bg-white/15 px-6 py-3 active:opacity-70">
            <Ionicons name="information-circle-outline" size={18} color={Colors.text} />
            <Text className="text-base font-bold text-white">Info</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
