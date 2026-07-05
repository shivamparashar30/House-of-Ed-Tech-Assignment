import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ERROR } from '@/constants/strings';
import { useThemeColors } from '@/hooks/use-theme-colors';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const Colors = useThemeColors();
  const displayMessage = message || ERROR.defaultMessage;
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-elevated">
        <Ionicons name="cloud-offline-outline" size={36} color={Colors.textSecondary} />
      </View>
      <Text className="text-center text-lg font-bold text-foreground">{ERROR.defaultTitle}</Text>
      <Text className="text-center text-sm leading-5 text-muted">{displayMessage}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-2 flex-row items-center gap-2 rounded-xl bg-primary px-5 py-2.5 active:opacity-80">
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text className="font-semibold text-white">{ERROR.retry}</Text>
        </Pressable>
      )}
    </View>
  );
}
