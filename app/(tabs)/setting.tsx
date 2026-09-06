// app/(tabs)/setting.tsx — Placeholder สำหรับ Setting
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../../lib/mockData';

export default function SettingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚙️</Text>
            <Text style={styles.title}>Setting</Text>
            <Text style={styles.subtitle}>ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Coming Soon</Text>
            </View>

            <View style={styles.menuList}>
                <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Profile', 'Coming soon')}>
                    <Text style={styles.menuIcon}>👤</Text>
                    <Text style={styles.menuText}>Profile</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Language', 'Coming soon')}>
                    <Text style={styles.menuIcon}>🌐</Text>
                    <Text style={styles.menuText}>Language</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('About', 'Archive App v1.0.0')}>
                    <Text style={styles.menuIcon}>ℹ️</Text>
                    <Text style={styles.menuText}>About</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: COLORS.canvas,
        alignItems: 'center', paddingTop: 40, padding: 20,
    },
    emoji: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', color: COLORS.ink, marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 20 },
    badge: {
        backgroundColor: COLORS.accentSoft, paddingHorizontal: 18, paddingVertical: 8,
        borderRadius: 20, marginBottom: 36,
    },
    badgeText: { fontWeight: '600', fontSize: 13, color: COLORS.accent },
    menuList: {
        width: '100%', backgroundColor: COLORS.surface,
        borderRadius: 12, borderWidth: 1, borderColor: COLORS.line,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 16, paddingHorizontal: 18,
        borderBottomWidth: 1, borderBottomColor: COLORS.line,
    },
    menuIcon: { fontSize: 20 },
    menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.ink },
    menuArrow: { fontSize: 20, color: COLORS.muted },
});
