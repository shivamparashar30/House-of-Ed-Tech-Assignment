import { FunctionsHttpError } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

// invoke() reports any non-2xx as a generic "non-2xx" message; the real reason
// is in the response body our function sent ({ error: ... }). Pull it out.
async function describeFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return body?.error ?? `Subscription service error (${error.context.status}).`;
    } catch {
      return 'Subscription service error.';
    }
  }
  return error instanceof Error ? error.message : 'Could not start subscription.';
}

// Mirrors Razorpay subscription lifecycle states.
export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'pending'
  | 'halted'
  | 'cancelled'
  | 'completed'
  | 'expired';

export interface Subscription {
  status: SubscriptionStatus;
  planId: string | null;
  razorpaySubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

function userId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

function rowToSubscription(row: Record<string, unknown>): Subscription {
  return {
    status: row.status as SubscriptionStatus,
    planId: (row.plan_id as string | null) ?? null,
    razorpaySubscriptionId: (row.razorpay_subscription_id as string | null) ?? null,
    currentPeriodEnd: (row.current_period_end as string | null) ?? null,
  };
}

export interface CreatedSubscription {
  subscriptionId: string;
  shortUrl: string;
}

export const subscriptionRemote = {
  async fetchCurrent(): Promise<Subscription | null> {
    const id = userId();
    if (!isSupabaseConfigured || !id) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();
    if (error || !data) return null;
    return rowToSubscription(data);
  },

  // Creates a Razorpay payment link via the Edge Function and returns its
  // hosted-checkout URL. supabase-js attaches the user's auth token.
  async create(planId: string): Promise<CreatedSubscription> {
    const { data, error } = await supabase.functions.invoke<CreatedSubscription>(
      'create-subscription',
      { body: { planId } },
    );
    if (error) {
      throw new Error(await describeFunctionError(error));
    }
    if (!data) {
      throw new Error('Could not start subscription.');
    }
    return data;
  },

  // Confirms payment server-side and activates access if paid, independent of
  // the webhook. Returns the resolved status.
  async verify(): Promise<string> {
    const { data, error } = await supabase.functions.invoke<{ status: string }>(
      'verify-subscription',
    );
    if (error) {
      throw new Error(await describeFunctionError(error));
    }
    return data?.status ?? 'none';
  },
};
