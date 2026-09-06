// app/(tabs)/_layout.tsx — Bottom Tab Bar 5 แท็บ เหมือน Topbar ฝั่งเว็บ
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

const ACCENT = '#146356';
const MUTED = '#5B6B67';

type TabIconProps = {
    emoji: string;
    focused: boolean;
};

function TabIcon({ emoji, focused }: TabIconProps) {
    return (
        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Text style={styles.emoji}>{emoji}</Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: '#FAFBFA' },
                headerTitleStyle: {
                    fontWeight: '600',
                    fontSize: 18,
                    color: '#16211F',
                },
                headerShadowVisible: false,
                tabBarActiveTintColor: ACCENT,
                tabBarInactiveTintColor: MUTED,
                tabBarStyle: {
                    backgroundColor: '#FAFBFA',
                    borderTopWidth: 1,
                    borderTopColor: '#DDE3E0',
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarLabelStyle: {
                    fontSize: 10.5,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="manage-tag"
                options={{
                    title: 'Manage Tag',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏷️" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Import File',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📤" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="create-tag"
                options={{
                    title: 'Create Tag',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="setting"
                options={{
                    title: 'Setting',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapActive: {
        backgroundColor: '#DCEDE8',
    },
    emoji: {
        fontSize: 18,
    },
});
