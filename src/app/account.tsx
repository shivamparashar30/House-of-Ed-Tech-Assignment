import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { planLabel } from '@/constants/plans';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useSubscription } from '@/hooks/use-subscription';
import { avatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { formatReleaseDate } from '@/lib/format';
import { isSubscriptionActive } from '@/lib/subscription';
import { useAuthStore } from '@/stores/auth-store';
import { useCollectionsStore } from '@/stores/collections-store';
import { useContinueWatchingStore } from '@/stores/continue-watching-store';
import { type ThemeMode, useThemeStore } from '@/stores/theme-store';
import { useWatchlistStore } from '@/stores/watchlist-store';

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-elevated py-4">
      <Text className="text-2xl font-extrabold text-foreground">{value}</Text>
      <Text className="mt-1 text-xs text-muted">{label}</Text>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <Text className="mb-2 mt-4 px-1 text-xs font-semibold uppercase tracking-wider text-muted">{title}</Text>;
}

function MenuRow({
  icon,
  label,
  onPress,
  trailing,
  destructive,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  trailing?: string;
  destructive?: boolean;
  colors: { primary: string; text: string; textSecondary: string };
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-elevated px-4 py-4 active:opacity-70">
      <Ionicons name={icon} size={20} color={destructive ? colors.primary : colors.text} />
      <Text className={cn('flex-1 text-base font-semibold', destructive ? 'text-primary' : 'text-foreground')}>
        {label}
      </Text>
      {trailing ? <Text className="text-sm text-muted">{trailing}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function AccountScreen() {
  const router = useRouter();
  const Colors = useThemeColors();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { data: subscription } = useSubscription();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const watchlistCount = useWatchlistStore((state) => state.items.length);
  const collectionsCount = useCollectionsStore((state) => state.collections.length);
  const continueCount = useContinueWatchingStore((state) => state.items.length);

  const displayName = (user?.user_metadata?.display_name as string) || 'BingeBox User';
  const email = user?.email ?? '';
  const memberSince = user?.created_at ? formatReleaseDate(user.created_at) : '';

  const isPremium = isSubscriptionActive(subscription);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-foreground">Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Animated.View entering={FadeInDown.duration(400).springify()} className="items-center gap-3 py-6">
          <View className="h-24 w-24 overflow-hidden rounded-3xl bg-elevated">
            <Image
              source={{ uri: avatarUrl(displayName) }}
              style={{ width: 96, height: 96 }}
              contentFit="cover"
            />
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-foreground">{displayName}</Text>
            {email ? <Text className="mt-0.5 text-sm text-muted">{email}</Text> : null}
            {memberSince ? (
              <Text className="mt-1 text-xs text-muted">Member since {memberSince}</Text>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(350).springify()} className="mt-2 flex-row gap-3">
          <StatTile value={watchlistCount} label="Watchlist" />
          <StatTile value={collectionsCount} label="Collections" />
          <StatTile value={continueCount} label="Watching" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(350).springify()}>
          <SectionLabel title="Appearance" />
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.mode;
              return (
                <Pressable
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  className={cn(
                    'flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-80',
                    active ? 'bg-primary' : 'bg-elevated',
                  )}>
                  <Ionicons name={opt.icon} size={16} color={active ? '#FFFFFF' : Colors.text} />
                  <Text className={cn('text-sm font-semibold', active ? 'text-white' : 'text-foreground')}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(350).springify()}>
          <SectionLabel title="Library" />
          <View className="gap-3">
            <MenuRow
              icon="bookmark-outline"
              label="My Watchlist"
              trailing={String(watchlistCount)}
              onPress={() => router.push('/watchlist')}
              colors={Colors}
            />
            <MenuRow
              icon="albums-outline"
              label="My Collections"
              trailing={String(collectionsCount)}
              onPress={() => router.push('/watchlist')}
              colors={Colors}
            />
          </View>
        </Animated.View>

        <Divider className="my-4" style={{ backgroundColor: Colors.border }} />

        <Animated.View entering={FadeInUp.delay(400).duration(350).springify()}>
          <SectionLabel title="Account" />
          <View className="gap-3">
            <MenuRow
              icon="card-outline"
              label="Subscription"
              trailing={isPremium ? planLabel(subscription?.planId) : 'Free'}
              onPress={() => router.push('/paywall')}
              colors={Colors}
            />
            <MenuRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => router.push('/notifications')}
              colors={Colors}
            />
          </View>
        </Animated.View>

        <Divider className="my-4" style={{ backgroundColor: Colors.border }} />

        <Animated.View entering={FadeInUp.delay(500).duration(350).springify()}>
          <SectionLabel title="About" />
          <View className="gap-3">
            <MenuRow
              icon="information-circle-outline"
              label="App Version"
              trailing="1.0.0"
              onPress={() => {}}
              colors={Colors}
            />
            <MenuRow
              icon="log-out-outline"
              label="Sign Out"
              destructive
              onPress={() => signOut()}
              colors={Colors}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(300)}>
          <Text className="mt-8 text-center text-xs text-muted">BingeBox • v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
