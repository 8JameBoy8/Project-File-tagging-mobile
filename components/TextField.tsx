// components/TextField.tsx — เทียบเท่า InputField.tsx ฝั่งเว็บ
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TextStyle, StyleProp } from 'react-native';

type Props = TextInputProps & {
  label: string;
  // ใช้ตอนวางฟอร์มบนพื้นหลังเข้ม (เช่น กล่อง preview สีเข้ม) — ป้ายชื่อสีเข้มดีฟอลต์จะกลืนไปกับพื้น
  labelStyle?: StyleProp<TextStyle>;
};

export default function TextField({ label, style, labelStyle, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput style={[styles.input, style]} placeholderTextColor="#9ca3af" {...inputProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#111' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
  },
});
