// app/(app)/(tabs)/_layout.tsx — แท็บหลัก 5 อัน เทียบเท่า Topbar.tsx ฝั่งเว็บเป๊ะๆ
// (Home, Manage Tag, Import File, Create Tag, Setting)
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="manage-tag" options={{ title: 'Manage Tag' }} />
      <Tabs.Screen name="upload" options={{ title: 'Import File' }} />
      <Tabs.Screen name="create-tag" options={{ title: 'Create Tag' }} />
      <Tabs.Screen name="setting" options={{ title: 'Setting' }} />
    </Tabs>
  );
}
