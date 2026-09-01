// app/(admin)/_layout.tsx — โซนของ admin เท่านั้น (เทียบเท่า src/app/admin/layout.tsx +
// การเช็ค role ที่ proxy.ts ทำฝั่งเว็บ) ต้อง login และต้องเป็น role 'ADMIN' เท่านั้นถึงจะเข้าได้
// หมายเหตุ: เหมือนฝั่งเว็บ — admin ไม่ได้ถูกกันจากโซน (app) ปกติ (ยังเข้า /user/* ได้ปกติ)
// กันแค่ทางกลับกัน: user ทั่วไปห้ามเข้าโซนนี้
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
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

  if (user.role !== 'ADMIN') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
