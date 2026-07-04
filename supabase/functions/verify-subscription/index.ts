// Confirms the signed-in user's latest Razorpay payment link directly via the
// Razorpay API and activates access if it's paid. This is the reliable path the
// app calls when returning from checkout — it does NOT depend on the webhook
// (no webhook secret, no event config), using the same server key that creates
// the link.
//
// Deploy:  supabase functions deploy verify-subscription   (keep Verify JWT ON)
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

// Access length per plan (days). Keys must match the app + create-subscription.
const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};
const DEFAULT_DAYS = 30;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing authorization header.' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ error: 'Invalid session.' }, 401);
  }
  const userId = userData.user.id;

  // Find the user's most recent payment link id + plan.
  const { data: row } = await supabase
    .from('subscriptions')
    .select('razorpay_subscription_id, plan_id')
    .eq('user_id', userId)
    .maybeSingle();

  const linkId = row?.razorpay_subscription_id;
  if (!linkId) {
    return json({ status: 'none' });
  }

  // Ask Razorpay for the link's current status.
  const razorpayResponse = await fetch(`https://api.razorpay.com/v1/payment_links/${linkId}`, {
    headers: {
      Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
    },
  });
  const link = await razorpayResponse.json();
  if (!razorpayResponse.ok) {
    return json({ error: link?.error?.description ?? 'Razorpay error.' }, 502);
  }

  if (link.status !== 'paid') {
    return json({ status: link.status });
  }

  // Paid — grant access for the plan's duration.
  const days = PLAN_DAYS[row?.plan_id ?? ''] ?? DEFAULT_DAYS;
  const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return json({ status: 'active' });
});
