import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search movies' }: SearchBarProps) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-2xl bg-elevated px-4"
      style={{ height: 48 }}>
      <Ionicons name="search" size={20} color={Colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        autoCorrect={false}
        returnKeyType="search"
        className="h-full flex-1 text-base text-white"
        style={{
          paddingVertical: 0,
          margin: 0,
          includeFontPadding: false,
          textAlignVertical: 'center',
          lineHeight: 20,
        }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} className="active:opacity-60">
          <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}
