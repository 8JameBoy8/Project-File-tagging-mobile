import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

function TabIcon({ text }: { text: string }) {
  return <Text style={styles.icon}>{text}</Text>;
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
            <TabIcon text={focused ? "⌂" : "⌂"} />
          ),
        }}
      />

      <Tabs.Screen
        name="approve"
        options={{
          title: "Approve / Select",
          tabBarIcon: ({ focused }) => (
            <TabIcon text={focused ? "✓" : "✓"} />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          tabBarIcon: ({ focused }) => (
            <TabIcon text={focused ? "⚙" : "⚙"} />
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