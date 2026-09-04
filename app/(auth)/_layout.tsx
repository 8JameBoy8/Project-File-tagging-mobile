import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect href={user.role === 'ADMIN' ? '/(admin)/(tabs)/home' : '/(app)/(tabs)/home'} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

