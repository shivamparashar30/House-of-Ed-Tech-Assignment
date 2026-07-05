import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

import { FILTER_LABELS } from '@/constants/strings';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type HomeSection = 'home' | 'movies' | 'tv';

interface HomeFilterBarProps {
  section: HomeSection;
  selectedGenreName?: string;
  onMovies: () => void;
  onTv: () => void;
  onCategories: () => void;
}

export function HomeFilterBar({
  section,
  selectedGenreName,
  onMovies,
  onTv,
  onCategories,
}: HomeFilterBarProps) {
  const Colors = useThemeColors();
  return (
    <View className="flex-row gap-2 px-5 py-3">
      <Chip
        selected={section === 'movies'}
        onPress={onMovies}
        showSelectedCheck={false}
        mode={section === 'movies' ? 'flat' : 'outlined'}
        textStyle={{ fontSize: 13, fontWeight: '600', color: section === 'movies' ? '#FFFFFF' : Colors.textSecondary }}
        style={{
          backgroundColor: section === 'movies' ? Colors.primary : Colors.elevated,
          borderColor: section === 'movies' ? Colors.primary : Colors.border,
        }}>
        {FILTER_LABELS.movies}
      </Chip>
      <Chip
        selected={section === 'tv'}
        onPress={onTv}
        showSelectedCheck={false}
        mode={section === 'tv' ? 'flat' : 'outlined'}
        textStyle={{ fontSize: 13, fontWeight: '600', color: section === 'tv' ? '#FFFFFF' : Colors.textSecondary }}
        style={{
          backgroundColor: section === 'tv' ? Colors.primary : Colors.elevated,
          borderColor: section === 'tv' ? Colors.primary : Colors.border,
        }}>
        {FILTER_LABELS.tvShows}
      </Chip>
      <Chip
        selected={Boolean(selectedGenreName)}
        onPress={onCategories}
        showSelectedCheck={false}
        mode={selectedGenreName ? 'flat' : 'outlined'}
        closeIcon={() => <Ionicons name="chevron-down" size={14} color={selectedGenreName ? '#FFFFFF' : Colors.textSecondary} />}
        onClose={onCategories}
        textStyle={{ fontSize: 13, fontWeight: '600', color: selectedGenreName ? '#FFFFFF' : Colors.textSecondary }}
        style={{
          backgroundColor: selectedGenreName ? Colors.primary : Colors.elevated,
          borderColor: selectedGenreName ? Colors.primary : Colors.border,
        }}>
        {selectedGenreName ?? FILTER_LABELS.categories}
      </Chip>
    </View>
  );
}
