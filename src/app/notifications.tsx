import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Linking, Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { NOTIFICATIONS } from '@/constants/strings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';
import { type AppNotification, useNotificationsStore } from '@/stores/notifications-store';

export default function NotificationsScreen() {
  const Colors = useThemeColors();
  const router = useRouter();
  const items = useNotificationsStore((state) => state.items);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const clear = useNotificationsStore((state) => state.clear);

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  function handleOpen(notification: AppNotification) {
    if (notification.launchUrl) Linking.openURL(notification.launchUrl);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-foreground">{NOTIFICATIONS.title}</Text>
        <View className="flex-1" />
        {items.length > 0 && (
          <Pressable onPress={clear} hitSlop={8} className="active:opacity-70">
            <Text className="text-sm font-semibold text-muted">{NOTIFICATIONS.clear}</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={NOTIFICATIONS.emptyTitle}
          message={NOTIFICATIONS.emptyMessage}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInRight.delay(index * 60).duration(350).springify()}>
              <Pressable
                onPress={() => handleOpen(item)}
                className={cn(
                  'flex-row gap-3 rounded-2xl bg-elevated p-4 active:opacity-70',
                  !item.read && 'border border-primary/40',
                )}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                  <Ionicons name="notifications" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">{item.title}</Text>
                  {item.body ? <Text className="mt-0.5 text-sm text-muted">{item.body}</Text> : null}
                  <Text className="mt-2 text-xs text-muted">{formatRelativeTime(item.receivedAt)}</Text>
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
