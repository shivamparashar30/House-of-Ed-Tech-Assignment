import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { posterUrl } from '@/api/client';
import type { MediaCardItem } from '@/api/types';
import { Colors } from '@/constants/theme';
import { formatYear } from '@/lib/format';

interface MediaListItemProps {
  item: MediaCardItem;
}

export function MediaListItem({ item }: MediaListItemProps) {
  const router = useRouter();
  const uri = posterUrl(item.poster_path, 'w342');
  const isTv = item.media_type === 'tv';
  const year = formatYear(item.release_date);
  const subtitle = [isTv ? 'TV Show' : 'Movie', year].filter(Boolean).join(' • ');

  return (
    <View className="flex-row items-center gap-3 px-1 py-2">
      <Pressable
        onPress={() => router.push(isTv ? `/tv/${item.id}` : `/movie/${item.id}`)}
        className="flex-1 flex-row items-center gap-3 active:opacity-80">
        <View className="h-[84px] w-14 items-center justify-center overflow-hidden rounded-lg bg-elevated">
          {uri ? (
            <Image source={{ uri }} style={{ width: 56, height: 84 }} contentFit="cover" />
          ) : (
            <Ionicons name="film-outline" size={22} color={Colors.textSecondary} />
          )}
        </View>
        <View className="flex-1">
          <Text numberOfLines={2} className="text-sm font-semibold text-white">
            {item.title}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push(isTv ? `/player/${item.id}?type=tv&season=1&episode=1` : `/player/${item.id}`)
        }
        className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80">
        <Ionicons name="play" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
