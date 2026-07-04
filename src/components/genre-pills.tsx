import { memo } from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

import type { Genre } from '@/api/types';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface GenrePillsProps {
  genres: Genre[];
}

export const GenrePills = memo(function GenrePills({ genres }: GenrePillsProps) {
  const Colors = useThemeColors();
  if (genres.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {genres.map((genre) => (
        <Chip
          key={genre.id}
          mode="outlined"
          compact
          textStyle={{ fontSize: 11, fontWeight: '500', color: Colors.textSecondary }}
          style={{ backgroundColor: Colors.elevated, borderColor: Colors.border, height: 28 }}>
          {genre.name}
        </Chip>
      ))}
    </View>
  );
});
