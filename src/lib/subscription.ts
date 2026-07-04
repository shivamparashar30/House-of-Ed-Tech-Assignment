import type { Subscription } from '@/api/subscription-remote';

// The paywall is only enforced once Razorpay is configured, so the app stays
// usable during development.
export const isSubscriptionEnforced = Boolean(process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID);

// 'authenticated' = mandate authorized, first charge pending; 'active' = charged.
// Both grant access so the user isn't stuck on the paywall mid-authorization.
const ACCESS_STATUSES = new Set(['active', 'authenticated']);

export function isSubscriptionActive(subscription: Subscription | null | undefined): boolean {
  if (!subscription || !ACCESS_STATUSES.has(subscription.status)) return false;
  if (!subscription.currentPeriodEnd) return true;
  return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
}
