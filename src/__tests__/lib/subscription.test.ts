import type { Subscription } from '@/api/subscription-remote';
import { isSubscriptionActive } from '@/lib/subscription';

function makeSub(overrides: Partial<Subscription> & Pick<Subscription, 'status'>): Subscription {
  return {
    planId: 'monthly',
    razorpaySubscriptionId: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}

describe('isSubscriptionActive', () => {
  it('returns false for null subscription', () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it('returns false for undefined subscription', () => {
    expect(isSubscriptionActive(undefined)).toBe(false);
  });

  it('returns true for active subscription with future end date', () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(isSubscriptionActive(makeSub({ status: 'active', currentPeriodEnd: futureDate }))).toBe(true);
  });

  it('returns true for authenticated subscription (mandate authorized)', () => {
    expect(isSubscriptionActive(makeSub({ status: 'authenticated' }))).toBe(true);
  });

  it('returns false for expired subscription', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(isSubscriptionActive(makeSub({ status: 'active', currentPeriodEnd: pastDate }))).toBe(false);
  });

  it('returns false for cancelled status', () => {
    expect(isSubscriptionActive(makeSub({ status: 'cancelled' }))).toBe(false);
  });

  it('returns true when currentPeriodEnd is null (no expiry set)', () => {
    expect(isSubscriptionActive(makeSub({ status: 'active' }))).toBe(true);
  });
});
