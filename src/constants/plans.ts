// Display-only catalog. Each `id` must match a key in the Edge Functions' PLAN
// map (create/verify/webhook), which holds the authoritative price + duration.
export interface Plan {
  id: string;
  label: string;
  price: string;
  period: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: 'monthly', label: 'Monthly', price: '₹149', period: 'per month' },
  { id: 'quarterly', label: 'Quarterly', price: '₹399', period: 'every 3 months', badge: 'Popular' },
  { id: 'yearly', label: 'Yearly', price: '₹1299', period: 'per year', badge: 'Best value' },
];

export const DEFAULT_PLAN_ID = 'quarterly';

export function planLabel(planId: string | null | undefined): string {
  return PLANS.find((plan) => plan.id === planId)?.label ?? 'Premium';
}
