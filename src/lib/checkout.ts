// Host of the `callback_url` the create-subscription Edge Function sets on the
// Razorpay link. Razorpay redirects here with `razorpay_payment_link_status=paid`
// once paid; the checkout WebView intercepts it to detect success.
const CALLBACK_HOST = 'bingebox.app';

export function isPaymentSuccessUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== CALLBACK_HOST) return false;
    return parsed.searchParams.get('razorpay_payment_link_status') === 'paid';
  } catch {
    return false;
  }
}
