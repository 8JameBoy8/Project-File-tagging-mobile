// app/(tabs)/create-tag.tsx — หน้า Create Tag: เลือกชื่อ + สี เหมือน CreateTag.html
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, PRESET_COLORS } from '../../lib/mockData';

interface CreatedTag {
    id: number;
    name: string;
    color: string;
    selected: boolean;
}

export default function CreateTagScreen() {
    const [tagName, setTagName] = useState('');
    const [currentColor, setCurrentColor] = useState('#d9d9d9');
    const [activeSwatchIdx, setActiveSwatchIdx] = useState(0);
    const [createdTags, setCreatedTags] = useState<CreatedTag[]>([]);
    const [hexInput, setHexInput] = useState('#d9d9d9');

    let nextId = createdTags.length > 0 ? Math.max(...createdTags.map(t => t.id)) + 1 : 1;

    const selectSwatch = (color: string, idx: number) => {
        setCurrentColor(color);
        setActiveSwatchIdx(idx);
        setHexInput(color);
    };

    const handleHexChange = (text: string) => {
        setHexInput(text);
        if (/^#[0-9a-fA-F]{6}$/.test(text)) {
            setCurrentColor(text);
            setActiveSwatchIdx(-1);
        }
    };

    const handleCreate = () => {
        const name = tagName.trim();
        if (!name) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อ Name Tag ก่อนทำการ Create');
            return;
        }
        setCreatedTags(prev => [
            ...prev,
            { id: nextId, name, color: currentColor, selected: false },
        ]);
        // Reset
        setTagName('');
        setCurrentColor('#d9d9d9');
        setActiveSwatchIdx(0);
        setHexInput('#d9d9d9');
    };

    const toggleTagSelect = (id: number) => {
        setCreatedTags(prev =>
            prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t)
        );
    };

    const handleDeleteSelected = () => {
        const selected = createdTags.filter(t => t.selected);
        if (selected.length === 0) {
            Alert.alert('แจ้งเตือน', 'กรุณาเลือกแท็กที่ต้องการลบก่อนครับ');
            return;
        }
        Alert.alert('ยืนยัน', `ลบแท็กที่เลือก ${selected.length} รายการ?`, [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive',
                onPress: () => setCreatedTags(prev => prev.filter(t => !t.selected)),
            },
        ]);
    };

    const selectedCount = createdTags.filter(t => t.selected).length;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Total tags */}
                <View style={styles.totalRow}>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalText}>Total tag : {createdTags.length}</Text>
                    </View>
                </View>

                {/* Name input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Name Tag</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type name here..."
                        placeholderTextColor={COLORS.muted}
                        value={tagName}
                        onChangeText={setTagName}
                    />
                </View>

                {/* Preview */}
                <View style={styles.previewSection}>
                    <View style={[styles.previewCircle, { backgroundColor: currentColor }]} />
                    <Text style={styles.previewLabel}>{tagName.trim() || 'Name Tag'}</Text>
                </View>

                {/* Color picker */}
                <View style={styles.colorBox}>
                    <Text style={styles.colorTitle}>Color Tag</Text>
                    <View style={styles.swatchGrid}>
                        {PRESET_COLORS.map((color, idx) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.swatch,
                                    { backgroundColor: color },
                                    activeSwatchIdx === idx && styles.swatchActive,
                                ]}
                                onPress={() => selectSwatch(color, idx)}
                            />
                        ))}
                    </View>
                    <View style={styles.customRow}>
                        <Text style={styles.customLabel}>Or Custom Color</Text>
                        <TextInput
                            style={styles.hexInput}
                            value={hexInput}
                            onChangeText={handleHexChange}
                            maxLength={7}
                            autoCapitalize="none"
                            placeholder="#000000"
                        />
                        <View style={[styles.hexPreview, { backgroundColor: currentColor }]} />
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.deleteBtn, selectedCount > 0 && styles.deleteBtnActive]}
                        onPress={handleDeleteSelected}
                    >
                        <Text style={[styles.deleteBtnText, selectedCount > 0 && styles.deleteBtnTextActive]}>
                            {selectedCount > 0 ? `Delete (${selectedCount})` : 'Delete Selected'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Create</Text>
                    </TouchableOpacity>
                </View>

                {/* Created tags */}
                <View style={styles.tagsArea}>
                    <Text style={styles.tagsAreaTitle}>Created Tags (Tap to select)</Text>
                    <View style={styles.tagsList}>
                        {createdTags.map(tag => (
                            <TouchableOpacity
                                key={tag.id}
                                style={[styles.createdTag, tag.selected && styles.createdTagSelected]}
                                onPress={() => toggleTagSelect(tag.id)}
                            >
                                <View style={[styles.createdTagDot, { backgroundColor: tag.color }]} />
                                <Text style={styles.createdTagName}>{tag.name}</Text>
                                {tag.selected && <Text style={styles.checkIcon}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                        {createdTags.length === 0 && (
                            <Text style={styles.noTags}>ยังไม่มีแท็กที่สร้าง — กดปุ่ม Create ด้านบน</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },
    scroll: { padding: 18, paddingBottom: 40 },

    totalRow: { alignItems: 'flex-end', marginBottom: 18 },
    totalBox: {
        backgroundColor: '#d9d9d9', borderWidth: 1, borderColor: '#333',
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 4,
    },
    totalText: { fontSize: 12, fontWeight: '500' },

    section: { marginBottom: 20 },
    label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: COLORS.ink },
    input: {
        height: 46, backgroundColor: '#e8e8e8', borderWidth: 1, borderColor: '#ccc',
        borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: COLORS.ink,
    },

    previewSection: { alignItems: 'center', marginBottom: 24 },
    previewCircle: {
        width: 120, height: 120, borderRadius: 60, marginBottom: 10,
        borderWidth: 2, borderColor: 'transparent',
    },
    previewLabel: { fontSize: 16, fontWeight: '500', color: COLORS.ink },

    colorBox: {
        backgroundColor: '#e8e8e8', borderWidth: 1, borderColor: '#ccc',
        borderRadius: 14, padding: 18, marginBottom: 24,
    },
    colorTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
    swatchGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
        gap: 12, marginBottom: 18,
    },
    swatch: {
        width: 38, height: 38, borderRadius: 19,
        borderWidth: 2, borderColor: 'transparent',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2,
    },
    swatchActive: {
        borderColor: '#333',
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4,
    },
    customRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, borderTopWidth: 1, borderTopColor: '#bbb', paddingTop: 14,
    },
    customLabel: { fontSize: 13, color: COLORS.muted },
    hexInput: {
        width: 90, height: 36, borderWidth: 1, borderColor: '#999',
        borderRadius: 6, textAlign: 'center', fontSize: 14, backgroundColor: '#fff',
    },
    hexPreview: { width: 36, height: 36, borderRadius: 6, borderWidth: 1, borderColor: '#999' },

    actions: { flexDirection: 'row', gap: 16, marginBottom: 28 },
    deleteBtn: {
        flex: 1, height: 48, backgroundColor: '#e8e8e8', borderWidth: 1, borderColor: '#333',
        borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
    deleteBtnActive: { backgroundColor: '#ffcccc', borderColor: '#cc0000' },
    deleteBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
    deleteBtnTextActive: { color: '#cc0000' },
    createBtn: {
        flex: 1, height: 48, backgroundColor: COLORS.accent,
        borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
    createBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    tagsArea: { borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 18 },
    tagsAreaTitle: { fontSize: 15, fontWeight: '600', color: COLORS.muted, marginBottom: 14 },
    tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    createdTag: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 14, paddingVertical: 9,
        backgroundColor: '#f0f0f0', borderWidth: 2, borderColor: '#ccc', borderRadius: 20,
    },
    createdTagSelected: { borderColor: '#333', backgroundColor: '#e0e0e0' },
    createdTagDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#999' },
    createdTagName: { fontSize: 14, color: COLORS.ink },
    checkIcon: { color: '#28a745', fontWeight: '700', fontSize: 16, marginLeft: 4 },
    noTags: { fontSize: 13, color: COLORS.muted, fontStyle: 'italic' },
});
