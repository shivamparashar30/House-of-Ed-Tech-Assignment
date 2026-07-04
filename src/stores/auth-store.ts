import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { create } from 'zustand';

import {
  clearSessionStart,
  getSessionStart,
  isSessionExpired,
  markSessionStart,
} from '@/lib/session';
import { supabase } from '@/lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  initialized: boolean;
  initialize: () => void;
  enforceSessionExpiry: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  user: null,
  initialized: false,
  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    restoreSession(set);

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearSessionStart();
      }
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
      });
    });

    // Re-check the hard cap on foreground, clearing a session that expired while backgrounded.
    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        get().enforceSessionExpiry();
      }
    });
  },
  enforceSessionExpiry: async () => {
    if (get().status !== 'authenticated') return;
    const startedAt = await getSessionStart();
    if (startedAt !== null && isSessionExpired(startedAt)) {
      await get().signOut();
    }
  },
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (!error) await markSessionStart();
    return { error: error?.message };
  },
  signUp: async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) return { error: error.message };
    if (data.session) await markSessionStart();
    return { needsConfirmation: !data.session };
  },
  signOut: async () => {
    await supabase.auth.signOut();
    await clearSessionStart();
  },
}));

// Restore a persisted session on launch, enforcing the hard cap first. Sessions
// predating the cap start their clock now (one-time migration).
async function restoreSession(set: (partial: Partial<AuthState>) => void) {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    set({ session: null, user: null, status: 'unauthenticated' });
    return;
  }

  const startedAt = await getSessionStart();

  if (startedAt === null) {
    await markSessionStart();
  } else if (isSessionExpired(startedAt)) {
    await supabase.auth.signOut();
    await clearSessionStart();
    set({ session: null, user: null, status: 'unauthenticated' });
    return;
  }

  set({ session, user: session.user, status: 'authenticated' });
}
