import { useEffect } from 'react';
import { type DimensionValue, View, useWindowDimensions } from 'react-native';
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

export function ListItemSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-2">
      <Skeleton width={56} height={84} radius={12} />
      <View className="flex-1 gap-2">
        <Skeleton width="70%" height={14} radius={4} />
        <Skeleton width="40%" height={12} radius={4} />
      </View>
      <Skeleton width={40} height={40} radius={20} />
    </View>
  );
}

export function GridSkeleton() {
  const { width } = useWindowDimensions();
  const cardW = (width - 32 - 24) / 3;

  return (
    <View className="gap-3 px-4 pt-4">
      {[0, 1, 2].map((row) => (
        <View key={row} className="flex-row gap-3">
          {[0, 1, 2].map((col) => (
            <View key={col} className="gap-2">
              <Skeleton width={cardW} height={cardW * 1.5} radius={16} />
              <Skeleton width={cardW * 0.7} height={12} radius={4} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
