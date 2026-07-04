import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { cn } from '@/lib/cn';
import { formatRating } from '@/lib/format';

interface RatingBadgeProps {
  voteAverage: number;
  className?: string;
}

export function RatingBadge({ voteAverage, className }: RatingBadgeProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full bg-black/60 px-2 py-1',
        className,
      )}>
      <Ionicons name="star" size={11} color={Colors.accent} />
      <Text className="text-xs font-semibold text-white">{formatRating(voteAverage)}</Text>
    </View>
  );
}
