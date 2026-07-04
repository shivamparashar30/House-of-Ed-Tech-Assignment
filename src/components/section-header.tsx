import { Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center gap-2 px-4">
      <View className="h-5 w-1 rounded-full bg-primary" />
      <Text className="text-lg font-bold text-foreground">{title}</Text>
    </View>
  );
}
