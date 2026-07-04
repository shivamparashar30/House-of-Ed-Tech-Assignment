import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { planLabel } from '@/constants/plans';
import { Colors } from '@/constants/theme';
import { useSubscription } from '@/hooks/use-subscription';
import { avatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/cn';
import { formatReleaseDate } from '@/lib/format';
import { isSubscriptionActive } from '@/lib/subscription';
import { useAuthStore } from '@/stores/auth-store';
import { useCollectionsStore } from '@/stores/collections-store';
import { useContinueWatchingStore } from '@/stores/continue-watching-store';
import { useWatchlistStore } from '@/stores/watchlist-store';

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center rounded-2xl bg-elevated py-4">
      <Text className="text-2xl font-extrabold text-white">{value}</Text>
      <Text className="mt-1 text-xs text-muted">{label}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
  trailing,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  trailing?: string;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-elevated px-4 py-4 active:opacity-70">
      <Ionicons name={icon} size={20} color={destructive ? Colors.primary : Colors.text} />
      <Text className={cn('flex-1 text-base font-semibold', destructive ? 'text-primary' : 'text-white')}>
        {label}
      </Text>
      {trailing ? <Text className="text-sm text-muted">{trailing}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { data: subscription } = useSubscription();

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
        <Text className="text-2xl font-extrabold text-white">Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center gap-3 py-6">
          <View className="h-24 w-24 overflow-hidden rounded-3xl bg-elevated">
            <Image
              source={{ uri: avatarUrl(displayName) }}
              style={{ width: 96, height: 96 }}
              contentFit="cover"
            />
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-white">{displayName}</Text>
            {email ? <Text className="mt-0.5 text-sm text-muted">{email}</Text> : null}
            {memberSince ? (
              <Text className="mt-1 text-xs text-muted">Member since {memberSince}</Text>
            ) : null}
          </View>
        </View>

        <View className="mt-2 flex-row gap-3">
          <StatTile value={watchlistCount} label="Watchlist" />
          <StatTile value={collectionsCount} label="Collections" />
          <StatTile value={continueCount} label="Watching" />
        </View>

        <View className="mt-5 gap-3">
          <MenuRow
            icon="bookmark-outline"
            label="My Watchlist"
            trailing={String(watchlistCount)}
            onPress={() => router.push('/watchlist')}
          />
          <MenuRow
            icon="card-outline"
            label="Subscription"
            trailing={isPremium ? planLabel(subscription?.planId) : 'Free'}
            onPress={() => router.push('/paywall')}
          />
          <MenuRow
            icon="log-out-outline"
            label="Sign Out"
            destructive
            onPress={() => signOut()}
          />
        </View>

        <Text className="mt-8 text-center text-xs text-muted">BingeBox • v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
