import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewProps } from 'react-native-webview';

import { CHECKOUT } from '@/constants/strings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { isPaymentSuccessUrl } from '@/lib/checkout';

interface CheckoutWebViewProps {
  url: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CheckoutWebView({ url, onSuccess, onCancel }: CheckoutWebViewProps) {
  const Colors = useThemeColors();
  const [loading, setLoading] = useState(true);

  const handleShouldStartLoad: WebViewProps['onShouldStartLoadWithRequest'] = (request) => {
    if (isPaymentSuccessUrl(request.url)) {
      onSuccess();
      return false;
    }
    return true;
  };

  return (
    <View className="absolute inset-0 bg-background">
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={onCancel}
            className="h-10 w-10 items-center justify-center active:opacity-70">
            <Ionicons name="close" size={26} color={Colors.text} />
          </Pressable>
          <Text className="text-base font-bold text-white">{CHECKOUT.title}</Text>
          <View className="h-10 w-10" />
        </View>

        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: Colors.background }}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-background">
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
