// app/(admin)/_layout.tsx

import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  // กำลังตรวจสอบ login
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ยังไม่ได้ login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // login แล้วแต่ไม่ใช่ Admin
  if (user.role !== 'ADMIN') {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  // เป็น Admin
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}