// app/(tabs)/manage-tag.tsx — หน้า Manage Tag: Grid view ไฟล์ เหมือน manage_tag.html
import React, { useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, MOCK_MANAGE_FILES } from '../../lib/mockData';

interface CardFile {
    id: number;
    name: string;
    icon: string;
    checked: boolean;
}

export default function ManageTagScreen() {
    const [files, setFiles] = useState<CardFile[]>(
        MOCK_MANAGE_FILES.map(f => ({ ...f, checked: false }))
    );
    const [searchText, setSearchText] = useState('');
    const [selectedTag, setSelectedTag] = useState('เลือกแท็ก...');

    const toggleCheck = (id: number) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
    };

    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleEdit = () => Alert.alert('แก้ไขแท็ก', 'ฟีเจอร์นี้ยังเป็น placeholder');
    const handleDeleteTag = () => Alert.alert('ลบแท็ก', 'ฟีเจอร์นี้ยังเป็น placeholder');

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Toolbar */}
            <View style={styles.toolbar}>
                <View style={styles.tagTools}>
                    <View style={styles.selectBox}>
                        <Text style={styles.selectText} numberOfLines={1}>{selectedTag}</Text>
                    </View>
                    <View style={styles.colorCircle} />
                    <TouchableOpacity style={styles.actionIcon} onPress={handleEdit}>
                        <Text style={{ fontSize: 16 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon} onPress={handleDeleteTag}>
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tag :"
                    placeholderTextColor={COLORS.muted}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Card grid */}
            <FlatList
                data={filteredFiles}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>ไม่พบไฟล์</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, item.checked && styles.cardChecked]}
                        onPress={() => toggleCheck(item.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.checkboxWrap}>
                            <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                                {item.checked && <Text style={styles.checkTick}>✓</Text>}
                            </View>
                        </View>
                        <View style={styles.cardPlaceholder}>
                            <Text style={styles.cardEmoji}>{item.icon}</Text>
                        </View>
                        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },

    // Toolbar
    toolbar: {
        paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    },
    tagTools: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.line,
        borderRadius: 10, padding: 10,
    },
    selectBox: {
        flex: 1, height: 36, backgroundColor: '#fff',
        borderWidth: 1, borderColor: COLORS.line, borderRadius: 6,
        justifyContent: 'center', paddingHorizontal: 10,
    },
    selectText: { fontSize: 13, color: COLORS.ink },
    colorCircle: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.line,
    },
    actionIcon: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.line,
        alignItems: 'center', justifyContent: 'center',
    },
    searchInput: {
        height: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.line,
        borderRadius: 8, paddingHorizontal: 12, fontSize: 14,
    },

    // Grid
    gridContent: { paddingHorizontal: 14, paddingBottom: 20 },
    gridRow: { gap: 14, marginBottom: 14 },
    card: {
        flex: 1, backgroundColor: COLORS.surfaceAlt,
        borderWidth: 2, borderColor: COLORS.line, borderRadius: 12,
        padding: 14, height: 180,
    },
    cardChecked: { borderColor: COLORS.accent },
    checkboxWrap: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
    checkbox: {
        width: 22, height: 22, borderRadius: 4,
        borderWidth: 2, borderColor: COLORS.line,
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
    },
    checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    checkTick: { fontSize: 13, color: '#fff', fontWeight: '700' },
    cardPlaceholder: {
        flex: 1, backgroundColor: '#dee2e6', borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    cardEmoji: { fontSize: 36 },
    cardName: {
        textAlign: 'center', fontWeight: '500', fontSize: 13, color: COLORS.muted,
    },
    emptyText: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 14 },
});
