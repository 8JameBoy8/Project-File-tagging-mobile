// components/PrimaryButton.tsx — เทียบเท่า AuthButton.tsx ฝั่งเว็บ
import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ title, onPress, loading, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.button, (disabled || loading) && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4cdb5a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700', color: '#000' },
});
