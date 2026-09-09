// app/(app)/(tabs)/_layout.tsx — แท็บหลัก 5 อัน เทียบเท่า Topbar.tsx ฝั่งเว็บเป๊ะๆ
// (Home, Manage Tag, Import File, Create Tag, Setting)
import { Tabs } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';
import { TabIcon } from '@/components/TabIcon';

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tab_home'),
          tabBarLabel: t('tab_home'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="manage-tag"
        options={{
          title: t('tab_manage_tag'),
          tabBarLabel: t('tab_manage_tag'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏷️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: t('tab_import_file'),
          tabBarLabel: t('tab_import_file'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="create-tag"
        options={{
          title: t('tab_create_tag'),
          tabBarLabel: t('tab_create_tag'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: t('tab_setting'),
          tabBarLabel: t('tab_setting'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
