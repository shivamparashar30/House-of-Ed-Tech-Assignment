import { View, useWindowDimensions } from 'react-native';

import { Skeleton } from '@/components/skeleton';

export function DetailSkeleton() {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 bg-background">
      <Skeleton width={width} height={420} radius={0} />

      <View className="gap-4 px-5 pt-5">
        <Skeleton width={width * 0.65} height={28} radius={8} />
        <Skeleton width={width * 0.4} height={16} radius={6} />

        <View className="flex-row gap-3">
          <Skeleton width={60} height={24} radius={12} />
          <Skeleton width={80} height={24} radius={12} />
          <Skeleton width={70} height={24} radius={12} />
        </View>

        <View className="flex-row gap-3">
          <Skeleton width={0} height={48} radius={12} className="flex-1" />
          <Skeleton width={52} height={48} radius={12} />
          <Skeleton width={52} height={48} radius={12} />
        </View>

        <View className="gap-2 pt-2">
          <Skeleton width={100} height={20} radius={6} />
          <Skeleton width="100%" height={14} radius={4} />
          <Skeleton width="100%" height={14} radius={4} />
          <Skeleton width="70%" height={14} radius={4} />
        </View>

        <View className="gap-3 pt-4">
          <Skeleton width={60} height={20} radius={6} />
          <View className="flex-row gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} className="items-center gap-2">
                <Skeleton width={72} height={72} radius={36} />
                <Skeleton width={60} height={10} radius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
