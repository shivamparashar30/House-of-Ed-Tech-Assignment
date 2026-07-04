import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth-store';

type Mode = 'signIn' | 'signUp';

function Field({
  icon,
  ...props
}: {
  icon: keyof typeof Ionicons.glyphMap;
} & ComponentProps<typeof TextInput>) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl bg-elevated px-4" style={{ height: 52 }}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <TextInput
        placeholderTextColor={Colors.textSecondary}
        className="flex-1 text-base text-white"
        style={{ padding: 0, includeFontPadding: false, textAlignVertical: 'center', height: '100%' }}
        {...props}
      />
    </View>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);

  const isSignUp = mode === 'signUp';

  async function handleSubmit() {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    if (isSignUp) {
      const { error: err, needsConfirmation } = await signUp(email, password, name || 'BingeBox User');
      setBusy(false);
      if (err) return setError(err);
      if (needsConfirmation) {
        setInfo('Account created. Check your email to confirm, then sign in.');
        setMode('signIn');
      }
    } else {
      const { error: err } = await signIn(email, password);
      setBusy(false);
      if (err) return setError(err);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">
          <View className="mb-10 flex-row items-center gap-2">
            <Ionicons name="film" size={30} color={Colors.primary} />
            <Text className="text-3xl font-extrabold tracking-tight text-white">
              Binge<Text className="text-primary">Box</Text>
            </Text>
          </View>

          <Text className="mb-1 text-2xl font-extrabold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="mb-6 text-sm text-muted">
            {isSignUp ? 'Sign up to start your watchlist.' : 'Sign in to continue watching.'}
          </Text>

          <View className="gap-3">
            {isSignUp && (
              <Field
                icon="person-outline"
                placeholder="Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <Field
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error && <Text className="mt-3 text-sm text-primary">{error}</Text>}
          {info && <Text className="mt-3 text-sm text-accent">{info}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={busy}
            className="mt-6 items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80"
            style={{ opacity: busy ? 0.7 : 1 }}>
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(isSignUp ? 'signIn' : 'signUp');
              setError(null);
              setInfo(null);
            }}
            className="mt-5 flex-row justify-center active:opacity-70">
            <Text className="text-sm text-muted">
              {isSignUp ? 'Already have an account? ' : 'New to BingeBox? '}
              <Text className="font-bold text-white">{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
