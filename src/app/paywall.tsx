import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckoutWebView } from '@/components/checkout-webview';
import { DEFAULT_PLAN_ID, PLANS, planLabel, type Plan } from '@/constants/plans';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useCreateCheckout } from '@/hooks/use-create-checkout';
import { useSubscription } from '@/hooks/use-subscription';
import { useVerifySubscription } from '@/hooks/use-verify-subscription';
import { cn } from '@/lib/cn';
import { isSubscriptionActive } from '@/lib/subscription';
import { useAuthStore } from '@/stores/auth-store';

const PLAN_BENEFITS = [
  'Unlimited streaming, ad-free',
  'Full HD playback on every title',
  'Watchlist & collections synced to your account',
  'Resume across all your devices',
];

function Benefit({ label }: { label: string }) {
  const Colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
      <Text className="flex-1 text-base text-foreground">{label}</Text>
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  const Colors = useThemeColors();
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'flex-row items-center justify-between rounded-2xl border-2 bg-elevated px-4 py-4 active:opacity-80',
        selected ? 'border-primary' : 'border-border',
      )}>
      <View className="flex-row items-center gap-3">
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={selected ? Colors.primary : Colors.textSecondary}
        />
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-foreground">{plan.label}</Text>
            {plan.badge ? (
              <View className="rounded-full bg-primary px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase text-white">{plan.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-sm text-muted">{plan.period}</Text>
        </View>
      </View>
      <Text className="text-lg font-extrabold text-foreground">{plan.price}</Text>
    </Pressable>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ActiveSubscriptionView() {
  const Colors = useThemeColors();
  const router = useRouter();
  const { data: subscription } = useSubscription();

  const currentPlan = PLANS.find((p) => p.id === subscription?.planId);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8} className="active:opacity-70">
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-foreground">Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center gap-2 rounded-2xl bg-elevated px-6 py-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Ionicons name="shield-checkmark" size={32} color={Colors.primary} />
          </View>
          <Text className="mt-2 text-xl font-extrabold text-foreground">Premium Active</Text>
          <Text className="text-sm text-muted">You have full access to BingeBox</Text>
        </View>

        <View className="mt-6 gap-3">
          <View className="flex-row items-center justify-between rounded-2xl bg-elevated px-4 py-4">
            <Text className="text-sm text-muted">Plan</Text>
            <Text className="text-base font-bold text-foreground">
              {planLabel(subscription?.planId)}
            </Text>
          </View>

          {currentPlan ? (
            <View className="flex-row items-center justify-between rounded-2xl bg-elevated px-4 py-4">
              <Text className="text-sm text-muted">Price</Text>
              <Text className="text-base font-bold text-foreground">
                {currentPlan.price} / {currentPlan.period}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between rounded-2xl bg-elevated px-4 py-4">
            <Text className="text-sm text-muted">Status</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#22C55E]" />
              <Text className="text-base font-bold text-[#22C55E]">
                {subscription?.status === 'authenticated' ? 'Active' : (subscription?.status ?? 'Active')}
              </Text>
            </View>
          </View>

          {subscription?.currentPeriodEnd ? (
            <View className="flex-row items-center justify-between rounded-2xl bg-elevated px-4 py-4">
              <Text className="text-sm text-muted">Renews on</Text>
              <Text className="text-base font-bold text-foreground">
                {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-8 gap-4">
          <Text className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">
            Your benefits
          </Text>
          {PLAN_BENEFITS.map((benefit) => (
            <Benefit key={benefit} label={benefit} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PaywallScreen() {
  const Colors = useThemeColors();
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_PLAN_ID);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const signOut = useAuthStore((state) => state.signOut);
  const createCheckout = useCreateCheckout();
  const verifySubscription = useVerifySubscription();
  const { data: subscription } = useSubscription();

  const isPremium = isSubscriptionActive(subscription);
  const busy = createCheckout.isPending || verifySubscription.isPending;

  // Track whether the user just completed payment in this session
  const justSubscribed = useRef(false);

  // Auto-dismiss only when the user just completed payment (not on initial load)
  useEffect(() => {
    if (justSubscribed.current && isPremium) {
      router.back();
    }
  }, [isPremium, router]);

  // Already subscribed — show management view
  if (isPremium && !checkoutUrl) {
    return <ActiveSubscriptionView />;
  }

  function handleSubscribe() {
    createCheckout.mutate(selectedPlanId, {
      onSuccess: ({ shortUrl }) => setCheckoutUrl(shortUrl),
      onError: (error) => {
        Alert.alert('Subscription failed', error.message);
      },
    });
  }

  function handlePaymentSuccess() {
    setCheckoutUrl(null);
    justSubscribed.current = true;
    verifySubscription.mutate(undefined, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        Alert.alert('Could not confirm payment', error.message);
      },
    });
  }

  function handlePaymentCancel() {
    setCheckoutUrl(null);
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <Animated.View entering={FadeInDown.duration(500).springify()} className="mb-8 flex-row items-center gap-2">
          <Ionicons name="film" size={30} color={Colors.primary} />
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">
            Binge<Text className="text-primary">Box</Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400).springify()}>
          <Text className="mb-1 text-2xl font-extrabold text-foreground">Go Premium</Text>
          <Text className="mb-6 text-sm text-muted">
            Subscribe to unlock the full BingeBox experience.
          </Text>
        </Animated.View>

        <View className="mb-8 gap-4">
          {PLAN_BENEFITS.map((benefit, index) => (
            <Animated.View key={benefit} entering={FadeInUp.delay(200 + index * 80).duration(350).springify()}>
              <Benefit label={benefit} />
            </Animated.View>
          ))}
        </View>

        <View className="gap-3">
          {PLANS.map((plan, index) => (
            <Animated.View key={plan.id} entering={FadeInUp.delay(550 + index * 100).duration(350).springify()}>
              <PlanCard
                plan={plan}
                selected={plan.id === selectedPlanId}
                onSelect={() => setSelectedPlanId(plan.id)}
              />
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(750).duration(400).springify()}>
          <Pressable
            onPress={handleSubscribe}
            disabled={busy}
            className="mt-6 items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80"
            style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">Subscribe</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => signOut()}
            className="mt-5 flex-row justify-center active:opacity-70">
            <Text className="text-sm text-muted">
              Not now? <Text className="font-bold text-foreground">Sign out</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {checkoutUrl ? (
        <CheckoutWebView
          url={checkoutUrl}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      ) : null}
    </SafeAreaView>
  );
}
