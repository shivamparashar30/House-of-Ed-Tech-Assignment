import { Text, View } from 'react-native';

import type { Genre } from '@/api/types';

interface GenrePillsProps {
  genres: Genre[];
}

export function GenrePills({ genres }: GenrePillsProps) {
  if (genres.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {genres.map((genre) => (
        <View key={genre.id} className="rounded-full border border-[#2A2A2A] bg-elevated px-3 py-1">
          <Text className="text-xs font-medium text-muted">{genre.name}</Text>
        </View>
      ))}
    </View>
  );
}
