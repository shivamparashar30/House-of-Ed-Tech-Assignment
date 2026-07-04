// Receives Razorpay webhooks, verifies the signature, and grants access when a
// payment link is paid. This is the authoritative source of a user's access.
//
// (Plan B: one-time payments. On `payment_link.paid` we set the row to active
// and grant ACCESS_DAYS of access from now.)
//
// Deploy:  supabase functions deploy razorpay-webhook --no-verify-jwt
//          (Razorpay calls it with its own signature, not a Supabase user JWT)
// Secrets: RAZORPAY_WEBHOOK_SECRET (set when creating the webhook in Razorpay)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;

// Access length per plan (days). Keys must match the app + create-subscription.
const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};
const DEFAULT_DAYS = 30;

// HMAC-SHA256 hex digest of the raw request body.
async function signBody(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(RAZORPAY_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  const expected = await signBody(rawBody);
  if (signature !== expected) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== 'payment_link.paid') {
    return new Response('Ignored', { status: 200 });
  }

  const entity = event.payload?.payment_link?.entity;
  if (!entity?.id) {
    return new Response('No payment link entity', { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Look up the plan on the stored row to grant the right access length.
  const { data: row } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('razorpay_subscription_id', entity.id)
    .maybeSingle();

  const days = PLAN_DAYS[row?.plan_id ?? ''] ?? DEFAULT_DAYS;
  const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', entity.id);

  return new Response('ok', { status: 200 });
});
