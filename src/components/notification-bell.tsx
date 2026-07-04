import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Badge } from 'react-native-paper';

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
        <View className="absolute" style={{ top: -4, right: -4 }}>
          <Badge size={18} style={{ backgroundColor: Colors.primary, fontWeight: '700', fontSize: 10 }}>
            {unread > 99 ? '99+' : unread}
          </Badge>
        </View>
      )}
    </Pressable>
  );
}
