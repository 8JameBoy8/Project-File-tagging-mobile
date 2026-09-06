// app/(tabs)/upload.tsx — Placeholder สำหรับ Import File
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/mockData';

export default function UploadScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>📤</Text>
            <Text style={styles.title}>Import File</Text>
            <Text style={styles.subtitle}>ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Coming Soon</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: COLORS.canvas,
        alignItems: 'center', justifyContent: 'center', padding: 30,
    },
    emoji: { fontSize: 56, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '700', color: COLORS.ink, marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 20 },
    badge: {
        backgroundColor: COLORS.accentSoft, paddingHorizontal: 18, paddingVertical: 8,
        borderRadius: 20,
    },
    badgeText: { fontWeight: '600', fontSize: 13, color: COLORS.accent },
});
