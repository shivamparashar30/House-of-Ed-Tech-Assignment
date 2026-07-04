import { useCallback, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';

interface NamePromptModalProps {
  visible: boolean;
  title: string;
  confirmLabel: string;
  initialValue?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NamePromptModal({
  visible,
  title,
  confirmLabel,
  initialValue = '',
  onSubmit,
  onClose,
}: NamePromptModalProps) {
  const Colors = useThemeColors();
  const [value, setValue] = useState(initialValue);

  const handleShow = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={handleShow}>
      <Pressable className="flex-1 items-center justify-center bg-black/70 px-8" onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full rounded-2xl bg-surface p-5">
          <Text className="mb-4 text-lg font-bold text-foreground">{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Collection name"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
            className="rounded-xl bg-elevated px-4 text-base text-foreground"
            style={{ height: 48, padding: 0, paddingHorizontal: 16 }}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          <View className="mt-5 flex-row justify-end gap-3">
            <Pressable onPress={onClose} className="px-4 py-2 active:opacity-70">
              <Text className="font-semibold text-muted">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              className="rounded-xl bg-primary px-5 py-2 active:opacity-80">
              <Text className="font-bold text-white">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
