import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';

import { backdropUrl } from '@/api/client';
import type { Episode } from '@/api/types';
import { Colors } from '@/constants/theme';
import { useFreeTierGuard } from '@/hooks/use-free-tier-guard';
import { formatRuntime } from '@/lib/format';

interface EpisodeListProps {
  showId: number;
  episodes: Episode[];
}

const EpisodeItem = memo(function EpisodeItem({
  episode,
  onPlay,
}: {
  episode: Episode;
  onPlay: (seasonNumber: number, episodeNumber: number) => void;
}) {
  const still = backdropUrl(episode.still_path, 'w780');
  const runtime = formatRuntime(episode.runtime);

  return (
    <Pressable
      onPress={() => onPlay(episode.season_number, episode.episode_number)}
      className="flex-row gap-3 active:opacity-80">
      <View className="h-20 w-32 items-center justify-center overflow-hidden rounded-lg bg-elevated">
        {still ? (
          <Image source={{ uri: still }} style={{ width: 128, height: 80 }} contentFit="cover" transition={200} />
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
});

export const EpisodeList = memo(function EpisodeList({ showId, episodes }: EpisodeListProps) {
  const router = useRouter();
  const { tryPlay } = useFreeTierGuard();

  const handlePlay = useCallback(
    (seasonNumber: number, episodeNumber: number) => {
      tryPlay(showId, () =>
        router.push(`/player/${showId}?type=tv&season=${seasonNumber}&episode=${episodeNumber}`),
      );
    },
    [showId, tryPlay, router],
  );

  if (episodes.length === 0) return null;

  return (
    <View className="gap-4 px-5">
      {episodes.map((episode) => (
        <EpisodeItem key={episode.id} episode={episode} onPlay={handlePlay} />
      ))}
    </View>
  );
});
