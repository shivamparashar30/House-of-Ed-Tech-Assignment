import { FlatList } from 'react-native';
import { Chip } from 'react-native-paper';

import type { Season } from '@/api/types';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface SeasonPickerProps {
  seasons: Season[];
  selectedSeason: number;
  onSelect: (seasonNumber: number) => void;
}

export function SeasonPicker({ seasons, selectedSeason, onSelect }: SeasonPickerProps) {
  const Colors = useThemeColors();
  return (
    <FlatList
      horizontal
      data={seasons}
      keyExtractor={(item) => String(item.id)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={3}
      renderItem={({ item }) => {
        const active = item.season_number === selectedSeason;
        return (
          <Chip
            selected={active}
            onPress={() => onSelect(item.season_number)}
            showSelectedCheck={false}
            mode={active ? 'flat' : 'outlined'}
            textStyle={{ fontSize: 13, fontWeight: '600', color: active ? '#FFFFFF' : Colors.textSecondary }}
            style={{
              backgroundColor: active ? Colors.primary : Colors.elevated,
              borderColor: active ? Colors.primary : '#2A2A2A',
            }}>
            {item.name}
          </Chip>
        );
      }}
    />
  );
}
