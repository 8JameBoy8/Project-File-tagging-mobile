// app/(app)/_layout.tsx — โซนที่ต้อง login (เทียบเท่า src/app/user/layout.tsx ฝั่งเว็บ + การ์ด
// ที่ proxy.ts ทำบนเว็บ) กันไม่ให้เข้าได้ถ้ายังไม่ login, ครอบ (tabs) + หน้า profile/file-passwords
// ที่ push ทับ tab bar (เข้าถึงจากปุ่มในหน้า Setting ไม่ใช่แท็บหลัก)
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
      <Stack.Screen name="file-passwords" options={{ headerShown: true, title: 'File Passwords' }} />
    </Stack>
  );
}
