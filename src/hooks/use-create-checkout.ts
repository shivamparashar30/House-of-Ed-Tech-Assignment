import { useMutation } from '@tanstack/react-query';

import { subscriptionRemote } from '@/api/subscription-remote';

// Creates the Razorpay payment link and returns its hosted-checkout URL.
export function useCreateCheckout() {
  return useMutation({
    mutationFn: (planId: string) => subscriptionRemote.create(planId),
  });
}
