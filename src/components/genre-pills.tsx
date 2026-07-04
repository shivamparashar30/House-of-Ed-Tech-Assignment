import { View } from 'react-native';
import { Chip } from 'react-native-paper';

import type { Genre } from '@/api/types';
import { Colors } from '@/constants/theme';

interface GenrePillsProps {
  genres: Genre[];
}

export function GenrePills({ genres }: GenrePillsProps) {
  if (genres.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {genres.map((genre) => (
        <Chip
          key={genre.id}
          mode="outlined"
          compact
          textStyle={{ fontSize: 11, fontWeight: '500', color: Colors.textSecondary }}
          style={{ backgroundColor: Colors.elevated, borderColor: '#2A2A2A', height: 28 }}>
          {genre.name}
        </Chip>
      ))}
    </View>
  );
}
