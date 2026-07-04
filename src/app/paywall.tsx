import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckoutWebView } from '@/components/checkout-webview';
import { DEFAULT_PLAN_ID, PLANS, type Plan } from '@/constants/plans';
import { Colors } from '@/constants/theme';
import { useCreateCheckout } from '@/hooks/use-create-checkout';
import { useVerifySubscription } from '@/hooks/use-verify-subscription';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth-store';

const PLAN_BENEFITS = [
  'Unlimited streaming, ad-free',
  'Full HD playback on every title',
  'Watchlist & collections synced to your account',
  'Resume across all your devices',
];

function Benefit({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
      <Text className="flex-1 text-base text-white">{label}</Text>
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
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'flex-row items-center justify-between rounded-2xl border-2 bg-elevated px-4 py-4 active:opacity-80',
        selected ? 'border-primary' : 'border-[#2A2A2A]',
      )}>
      <View className="flex-row items-center gap-3">
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={selected ? Colors.primary : Colors.textSecondary}
        />
        <View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-bold text-white">{plan.label}</Text>
            {plan.badge ? (
              <View className="rounded-full bg-primary px-2 py-0.5">
                <Text className="text-[10px] font-bold uppercase text-white">{plan.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-sm text-muted">{plan.period}</Text>
        </View>
      </View>
      <Text className="text-lg font-extrabold text-white">{plan.price}</Text>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_PLAN_ID);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const signOut = useAuthStore((state) => state.signOut);
  const createCheckout = useCreateCheckout();
  const verifySubscription = useVerifySubscription();

  const busy = createCheckout.isPending || verifySubscription.isPending;

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
    verifySubscription.mutate(undefined, {
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
        <View className="mb-8 flex-row items-center gap-2">
          <Ionicons name="film" size={30} color={Colors.primary} />
          <Text className="text-3xl font-extrabold tracking-tight text-white">
            Binge<Text className="text-primary">Box</Text>
          </Text>
        </View>

        <Text className="mb-1 text-2xl font-extrabold text-white">Go Premium</Text>
        <Text className="mb-6 text-sm text-muted">
          Subscribe to unlock the full BingeBox experience.
        </Text>

        <View className="mb-8 gap-4">
          {PLAN_BENEFITS.map((benefit) => (
            <Benefit key={benefit} label={benefit} />
          ))}
        </View>

        <View className="gap-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={plan.id === selectedPlanId}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </View>

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
            Not now? <Text className="font-bold text-white">Sign out</Text>
          </Text>
        </Pressable>
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
