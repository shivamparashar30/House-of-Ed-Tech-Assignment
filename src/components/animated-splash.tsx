import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TOTAL_DURATION = 2200;

const appIcon = require('@/assets/images/icon.png');

export function AnimatedSplash({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-180);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(16);
  const containerScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Icon spins in and scales up
    iconScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    iconRotate.value = withSpring(0, { damping: 12, stiffness: 150 });

    // 2. Text fades in and slides up
    textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 12, stiffness: 200 }));

    // 3. After a pause, scale up and fade out
    containerScale.value = withDelay(
      TOTAL_DURATION - 500,
      withTiming(1.1, { duration: 300, easing: Easing.out(Easing.cubic) }),
    );
    containerOpacity.value = withDelay(
      TOTAL_DURATION - 400,
      withTiming(0, { duration: 350 }, (finished) => {
        if (finished) {
          runOnJS(setVisible)(false);
          runOnJS(onComplete)();
        }
      }),
    );
  }, [iconScale, iconRotate, textOpacity, textTranslateY, containerScale, containerOpacity, onComplete]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0F0F0F',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        },
        containerStyle,
      ]}>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <Animated.View style={iconStyle}>
          <Image
            source={appIcon}
            style={{ width: 100, height: 100, borderRadius: 22 }}
          />
        </Animated.View>

        <Animated.View style={textStyle}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 }}>
            Binge<Text style={{ color: '#E50914' }}>Box</Text>
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
