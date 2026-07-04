import AsyncStorage from '@react-native-async-storage/async-storage';

import { SESSION_MAX_AGE_MS, SESSION_STARTED_AT_KEY } from '@/constants/session';

export function isSessionExpired(startedAt: number, now: number = Date.now()) {
  return now - startedAt >= SESSION_MAX_AGE_MS;
}

// Called only on fresh sign-in/sign-up, never on restore, so the cap counts
// from the real login.
export async function markSessionStart(now: number = Date.now()) {
  await AsyncStorage.setItem(SESSION_STARTED_AT_KEY, String(now));
}

export async function getSessionStart(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function clearSessionStart() {
  await AsyncStorage.removeItem(SESSION_STARTED_AT_KEY);
}
