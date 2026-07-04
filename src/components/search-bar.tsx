import { Searchbar } from 'react-native-paper';

import { Colors } from '@/constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search movies' }: SearchBarProps) {
  return (
    <Searchbar
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textSecondary}
      iconColor={Colors.textSecondary}
      inputStyle={{ color: Colors.text, fontSize: 15 }}
      style={{
        backgroundColor: Colors.elevated,
        borderRadius: 16,
        height: 48,
      }}
      autoCorrect={false}
      returnKeyType="search"
    />
  );
}
