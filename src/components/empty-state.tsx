import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface EmptyStateProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10 py-20">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-elevated">
        <Ionicons name={icon} size={36} color={Colors.textSecondary} />
      </View>
      <Text className="text-center text-lg font-bold text-white">{title}</Text>
      <Text className="text-center text-sm leading-5 text-muted">{message}</Text>
    </View>
  );
}
