// OneSignal app ID is public by design (it identifies the app to OneSignal's
// SDK, like a Supabase anon key). Its presence is what turns push on.
const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

export const onesignalAppId = appId ?? '';

export const isOneSignalConfigured = Boolean(
  appId && !appId.includes('your_onesignal'),
);
