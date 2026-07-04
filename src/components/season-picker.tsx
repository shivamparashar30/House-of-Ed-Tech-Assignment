import { FlatList, Pressable, Text } from 'react-native';

import type { Season } from '@/api/types';
import { cn } from '@/lib/cn';

interface SeasonPickerProps {
  seasons: Season[];
  selectedSeason: number;
  onSelect: (seasonNumber: number) => void;
}

export function SeasonPicker({ seasons, selectedSeason, onSelect }: SeasonPickerProps) {
  return (
    <FlatList
      horizontal
      data={seasons}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      renderItem={({ item }) => {
        const active = item.season_number === selectedSeason;
        return (
          <Pressable
            onPress={() => onSelect(item.season_number)}
            className={cn(
              'rounded-full px-4 py-2 active:opacity-80',
              active ? 'bg-primary' : 'bg-elevated',
            )}>
            <Text className={cn('text-sm font-semibold', active ? 'text-white' : 'text-muted')}>
              {item.name}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
