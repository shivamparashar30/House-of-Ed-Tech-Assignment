import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/cn';
import type { UnifiedGenre } from '@/lib/genres';

interface GenreDropdownProps {
  visible: boolean;
  top: number;
  genres: UnifiedGenre[];
  isLoading: boolean;
  selectedName?: string;
  onSelect: (genre: UnifiedGenre) => void;
  onClose: () => void;
}

export function GenreDropdown({
  visible,
  top,
  genres,
  isLoading,
  selectedName,
  onSelect,
  onClose,
}: GenreDropdownProps) {
  const Colors = useThemeColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 150 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.9 + progress.value * 0.1 }, { translateY: (1 - progress.value) * -6 }],
  }));

  if (!visible) return null;

  return (
    <>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <Animated.View
        style={[
          {
            position: 'absolute',
            top,
            right: 20,
            width: 220,
            maxHeight: 360,
            transformOrigin: 'top right',
            shadowColor: '#000',
            shadowOpacity: 0.5,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
          },
          animatedStyle,
        ]}
        className="overflow-hidden rounded-2xl border border-[#262626] bg-elevated">
        {isLoading ? (
          <View className="py-8">
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {genres.map((genre) => {
              const active = genre.name === selectedName;
              return (
                <Pressable
                  key={genre.name}
                  onPress={() => onSelect(genre)}
                  className="flex-row items-center justify-between px-4 py-3 active:bg-surface">
                  <Text
                    className={cn(
                      'text-sm',
                      active ? 'font-bold text-primary' : 'font-medium text-foreground',
                    )}>
                    {genre.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}
