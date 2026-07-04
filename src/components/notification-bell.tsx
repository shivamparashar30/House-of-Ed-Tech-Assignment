import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Badge } from 'react-native-paper';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { useUnreadNotificationCount } from '@/stores/notifications-store';

export function NotificationBell() {
  const Colors = useThemeColors();
  const router = useRouter();
  const unread = useUnreadNotificationCount();
  const prevUnread = useRef(unread);

  const rotation = useSharedValue(0);
  const badgeScale = useSharedValue(unread > 0 ? 1 : 0);

  useEffect(() => {
    if (unread > prevUnread.current) {
      // New notification arrived — shake the bell
      rotation.value = withSequence(
        withTiming(-15, { duration: 60 }),
        withRepeat(withSequence(withTiming(15, { duration: 80 }), withTiming(-15, { duration: 80 })), 3, true),
        withTiming(0, { duration: 60 }),
      );
      // Bounce the badge in
      badgeScale.value = withSequence(
        withSpring(1.4, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 300 }),
      );
    } else if (unread === 0) {
      badgeScale.value = withTiming(0, { duration: 200 });
    }
    prevUnread.current = unread;
  }, [unread, rotation, badgeScale]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      hitSlop={8}
      className="relative h-11 w-11 items-center justify-center rounded-xl bg-elevated active:opacity-70">
      <Animated.View style={bellStyle}>
        <Ionicons name="notifications-outline" size={20} color={Colors.text} />
      </Animated.View>
      {unread > 0 && (
        <Animated.View className="absolute" style={[{ top: -4, right: -4 }, badgeAnimStyle]}>
          <Badge size={18} style={{ backgroundColor: Colors.primary, fontWeight: '700', fontSize: 10 }}>
            {unread > 99 ? '99+' : unread}
          </Badge>
        </Animated.View>
      )}
    </Pressable>
  );
}
