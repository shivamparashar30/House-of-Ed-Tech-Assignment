import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { backdropUrl } from '@/api/client';
import type { Episode } from '@/api/types';
import { Colors } from '@/constants/theme';
import { formatRuntime } from '@/lib/format';

interface EpisodeListProps {
  showId: number;
  episodes: Episode[];
}

export function EpisodeList({ showId, episodes }: EpisodeListProps) {
  const router = useRouter();

  if (episodes.length === 0) return null;

  return (
    <View className="gap-4 px-5">
      {episodes.map((episode) => {
        const still = backdropUrl(episode.still_path, 'w780');
        const runtime = formatRuntime(episode.runtime);
        return (
          <Pressable
            key={episode.id}
            onPress={() =>
              router.push(
                `/player/${showId}?type=tv&season=${episode.season_number}&episode=${episode.episode_number}`,
              )
            }
            className="flex-row gap-3 active:opacity-80">
            <View className="h-20 w-32 items-center justify-center overflow-hidden rounded-lg bg-elevated">
              {still ? (
                <Image source={{ uri: still }} style={{ width: 128, height: 80 }} contentFit="cover" />
              ) : (
                <Ionicons name="tv-outline" size={24} color={Colors.textSecondary} />
              )}
              <View className="absolute h-8 w-8 items-center justify-center rounded-full bg-black/55">
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View className="flex-1 gap-1">
              <Text numberOfLines={1} className="text-sm font-semibold text-white">
                {episode.episode_number}. {episode.name}
              </Text>
              {runtime ? <Text className="text-xs text-muted">{runtime}</Text> : null}
              {episode.overview ? (
                <Text numberOfLines={2} className="text-xs leading-4 text-muted">
                  {episode.overview}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
