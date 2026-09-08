// app/index.tsx — เทียบเท่า proxy.ts ฝั่งเว็บ: เช็ค login แล้วพาไปหน้าที่ถูกต้อง
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href={user.role === 'ADMIN' ? '/(admin)/(tabs)/home' : '/(app)/(tabs)/home'} />;
}
