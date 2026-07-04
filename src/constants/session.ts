// Hard cap on session lifetime: the user is signed out automatically once this
// long has passed since sign-in, on next launch or foreground.
const SESSION_MAX_AGE_DAYS = 3;

export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

// AsyncStorage key holding the epoch-millis timestamp of the current sign-in.
export const SESSION_STARTED_AT_KEY = '@bingebox/session_started_at';
