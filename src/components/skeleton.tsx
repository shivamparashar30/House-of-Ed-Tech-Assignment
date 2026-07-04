import { useEffect } from 'react';
import { type DimensionValue, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  className?: string;
}

export function Skeleton({ width, height, radius = 12 }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: '#1F1F1F' }, animatedStyle]}
    />
  );
}

export function CarouselSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View className="flex-row gap-3 px-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} width={cardWidth} height={cardWidth * 1.5} radius={16} />
      ))}
    </View>
  );
}
