import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useUnreadNotificationCount } from '@/stores/notifications-store';

export function NotificationBell() {
  const router = useRouter();
  const unread = useUnreadNotificationCount();

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      hitSlop={8}
      className="relative h-11 w-11 items-center justify-center rounded-xl bg-elevated active:opacity-70">
      <Ionicons name="notifications-outline" size={20} color={Colors.text} />
      {unread > 0 && (
        <View
          className="absolute h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1"
          style={{ top: -6, right: -6 }}>
          <Text
            className="text-[10px] font-bold text-white"
            style={{ includeFontPadding: false, textAlignVertical: 'center' }}>
            {unread > 99 ? '99+' : unread}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
