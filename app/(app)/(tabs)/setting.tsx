// app/(app)/(tabs)/setting.tsx
// ตัวอย่างที่ต่อ logout จริงแล้ว + navigate ไปหน้า profile/file-passwords (อยู่นอก tab bar
// เหมือนฝั่งเว็บที่ Setting เป็นทางเข้าไปหน้าพวกนี้ ไม่ใช่แท็บแยก)
// TODO: หน้าเปลี่ยนภาษา (PATCH /api/profile { language: 'TH' | 'EN' }) ยังไม่ได้ทำ
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import PrimaryButton from '@/components/PrimaryButton';

export default function SettingScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <PrimaryButton title="File Passwords" onPress={() => router.push('/(app)/file-passwords')} />
      <PrimaryButton title="Profile" onPress={() => router.push('/(app)/profile')} />
      <PrimaryButton title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 14 },
});
