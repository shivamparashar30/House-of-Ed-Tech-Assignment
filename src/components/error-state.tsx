import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-elevated">
        <Ionicons name="cloud-offline-outline" size={36} color={Colors.textSecondary} />
      </View>
      <Text className="text-center text-lg font-bold text-white">Something went wrong</Text>
      <Text className="text-center text-sm leading-5 text-muted">
        {message ?? 'We couldn’t load this content. Please try again.'}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-2 flex-row items-center gap-2 rounded-xl bg-primary px-5 py-2.5 active:opacity-80">
          <Ionicons name="refresh" size={16} color={Colors.text} />
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
