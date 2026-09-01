// app/(admin)/(tabs)/_layout.tsx — แท็บหลัก 3 อัน เทียบเท่า AppShell.tsx ฝั่งเว็บ
// (Home, Approve / Select, Setting) ดู src/components/AppShell.tsx ในโปรเจกต์เว็บ
import { Tabs } from 'expo-router';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="approve" options={{ title: 'Approve / Select' }} />
      <Tabs.Screen name="setting" options={{ title: 'Setting' }} />
    </Tabs>
  );
}
