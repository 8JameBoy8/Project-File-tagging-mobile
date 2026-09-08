import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

// สีเปลี่ยนตาม focused เพื่อให้เห็นชัดว่าอยู่แท็บไหน (ให้ตรงกับ tabBarActiveTintColor/
// tabBarInactiveTintColor ด้านล่าง — ไอคอนตัวอักษรเฉยๆ ไม่ได้รับสีนี้อัตโนมัติ ต้องส่งเองตรงนี้)
function TabIcon({ text, focused }: { text: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, { color: focused ? "#176B34" : "#94A3B8" }]}>
      {text}
    </Text>
  );
}

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#176B34",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E1E6E3",
          backgroundColor: "#FFFFFF",
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon text="⌂" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="approve"
        options={{
          title: "Approve / Select",
          tabBarIcon: ({ focused }) => (
            <TabIcon text="✓" focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ focused }) => (
            <TabIcon text="⚙" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
  },
});