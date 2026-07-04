import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { cn } from '@/lib/cn';

export type HomeSection = 'home' | 'movies' | 'tv';

interface HomeFilterBarProps {
  section: HomeSection;
  selectedGenreName?: string;
  onMovies: () => void;
  onTv: () => void;
  onCategories: () => void;
}

function Chip({
  label,
  active,
  onPress,
  trailingIcon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  trailingIcon?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1 rounded-full border px-4 py-1.5 active:opacity-80',
        active ? 'border-primary bg-primary' : 'border-[#2A2A2A] bg-elevated',
      )}>
      <Text className={cn('text-sm font-semibold', active ? 'text-white' : 'text-muted')}>
        {label}
      </Text>
      {trailingIcon && (
        <Ionicons name="chevron-down" size={14} color={active ? '#FFFFFF' : Colors.textSecondary} />
      )}
    </Pressable>
  );
}

export function HomeFilterBar({
  section,
  selectedGenreName,
  onMovies,
  onTv,
  onCategories,
}: HomeFilterBarProps) {
  return (
    <View className="flex-row gap-2 px-5 py-3">
      <Chip label="Movies" active={section === 'movies'} onPress={onMovies} />
      <Chip label="TV Shows" active={section === 'tv'} onPress={onTv} />
      <Chip
        label={selectedGenreName ?? 'Categories'}
        active={Boolean(selectedGenreName)}
        onPress={onCategories}
        trailingIcon
      />
    </View>
  );
}
