// app/(tabs)/index.tsx — หน้า Home: แสดงรายการไฟล์ + preview เหมือน home.html
import React, { useState, useMemo } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal,
    ScrollView, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_FILES, TYPE_COLORS, COLORS, MockFile } from '../../lib/mockData';

type SortMode = 'date-desc' | 'date-asc' | 'type' | 'name';

export default function HomeScreen() {
    const [files, setFiles] = useState<MockFile[]>([...MOCK_FILES]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>('date-desc');
    const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
    const [showSortModal, setShowSortModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);

    // All unique tags
    const allTags = useMemo(() => {
        const s = new Set<string>();
        files.forEach(f => f.tags.forEach(t => s.add(t)));
        return Array.from(s).sort();
    }, [files]);

    // Filtered & sorted list
    const visibleFiles = useMemo(() => {
        let list = [...files];
        if (activeTags.size > 0) {
            list = list.filter(f => f.tags.some(t => activeTags.has(t)));
        }
        switch (sortMode) {
            case 'date-desc': list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
            case 'date-asc': list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); break;
            case 'type': list.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)); break;
            case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return list;
    }, [files, sortMode, activeTags]);

    const selectedFile = files.find(f => f.id === selectedId) || null;

    const handleDelete = () => {
        if (!selectedFile) return;
        Alert.alert('ยืนยันการลบ', `ต้องการลบไฟล์ "${selectedFile.name}" ใช่หรือไม่?`, [
            { text: 'ยกเลิก', style: 'cancel' },
            {
                text: 'ลบ', style: 'destructive', onPress: () => {
                    setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
                    setSelectedId(null);
                }
            },
        ]);
    };

    const handleDownload = () => {
        if (!selectedFile) return;
        Alert.alert('ดาวน์โหลด', `กำลังดาวน์โหลด "${selectedFile.name}" (mock)`);
    };

    const toggleTag = (tag: string) => {
        setActiveTags(prev => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag); else next.add(tag);
            return next;
        });
    };

    const fmtDate = (d: string) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const SORT_LABELS: Record<SortMode, string> = {
        'date-desc': 'อัปโหลดล่าสุด',
        'date-asc': 'อัปโหลดเก่าสุด',
        type: 'ตามประเภทไฟล์',
        name: 'ชื่อไฟล์ (A-Z)',
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Detail section when file selected */}
            {selectedFile && (
                <View style={styles.detailCard}>
                    <View style={[styles.previewBox, { backgroundColor: TYPE_COLORS[selectedFile.type].soft }]}>
                        <Text style={styles.previewEmoji}>{TYPE_COLORS[selectedFile.type].emoji}</Text>
                        <Text style={styles.previewExt}>.{selectedFile.ext}</Text>
                    </View>
                    <Text style={styles.detailName} numberOfLines={1}>{selectedFile.name}</Text>
                    <View style={styles.tagRow}>
                        {selectedFile.tags.map(t => (
                            <View key={t} style={styles.tagChip}>
                                <View style={styles.tagDot} />
                                <Text style={styles.tagChipText}>{t}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.btnDownload} onPress={handleDownload}>
                            <Text style={styles.btnDownloadText}>⬇ Download</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={handleDelete}>
                            <Text style={styles.btnDeleteText}>🗑 Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Filter bar */}
            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterBtn} onPress={() => setShowSortModal(true)}>
                    <Text style={styles.filterBtnText}>⇅ {SORT_LABELS[sortMode]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterBtn} onPress={() => setShowTagModal(true)}>
                    <Text style={styles.filterBtnText}>🏷 Search tag</Text>
                    {activeTags.size > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{activeTags.size}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* File list */}
            <FlatList
                data={visibleFiles}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={visibleFiles.length === 0 ? styles.emptyWrap : undefined}
                ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบไฟล์ที่ตรงกับตัวกรอง</Text>}
                renderItem={({ item }) => {
                    const meta = TYPE_COLORS[item.type];
                    const isSelected = item.id === selectedId;
                    return (
                        <TouchableOpacity
                            style={[styles.fileRow, isSelected && styles.fileRowSelected]}
                            onPress={() => setSelectedId(item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.fileThumb, { backgroundColor: meta.soft }]}>
                                <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.fileTagRow}>
                                    {item.tags.map(t => (
                                        <View key={t} style={styles.fileTag}>
                                            <View style={styles.tagDotSm} />
                                            <Text style={styles.fileTagText}>{t}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.fileDate}>{fmtDate(item.date)}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Sort Modal */}
            <Modal visible={showSortModal} transparent animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>เรียงตาม</Text>
                        {(['date-desc', 'date-asc', 'type', 'name'] as SortMode[]).map(mode => (
                            <TouchableOpacity
                                key={mode}
                                style={[styles.modalOption, sortMode === mode && styles.modalOptionActive]}
                                onPress={() => { setSortMode(mode); setShowSortModal(false); }}
                            >
                                <Text style={[styles.modalOptionText, sortMode === mode && styles.modalOptionTextActive]}>
                                    {SORT_LABELS[mode]}
                                </Text>
                                {sortMode === mode && <Text style={styles.checkMark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {/* Tag Filter Modal */}
            <Modal visible={showTagModal} transparent animationType="slide">
                <Pressable style={styles.modalOverlay} onPress={() => setShowTagModal(false)}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>เลือกแท็ก</Text>
                            <TouchableOpacity onPress={() => setActiveTags(new Set())}>
                                <Text style={styles.clearLink}>ล้างทั้งหมด</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {allTags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={styles.tagOptionRow}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <View style={[styles.checkbox, activeTags.has(tag) && styles.checkboxActive]}>
                                        {activeTags.has(tag) && <Text style={styles.checkboxTick}>✓</Text>}
                                    </View>
                                    <Text style={styles.tagOptionText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.canvas },

    // Detail card
    detailCard: {
        backgroundColor: COLORS.surface,
        margin: 14,
        marginBottom: 6,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.line,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    previewBox: {
        height: 120,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    previewEmoji: { fontSize: 42 },
    previewExt: { fontSize: 12, fontWeight: '600', color: COLORS.muted, marginTop: 4 },
    detailName: { fontWeight: '700', fontSize: 16, color: COLORS.ink, marginBottom: 8 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    tagChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line,
        paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6,
    },
    tagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
    tagChipText: { fontSize: 11.5, color: COLORS.ink },
    actionRow: { flexDirection: 'row', gap: 10 },
    btnDownload: {
        flex: 1, backgroundColor: COLORS.okSoft, paddingVertical: 11,
        borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#BFE0CC',
    },
    btnDownloadText: { fontWeight: '600', fontSize: 14, color: COLORS.ok },
    btnDelete: {
        flex: 1, backgroundColor: COLORS.dangerSoft, paddingVertical: 11,
        borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#EFC7C0',
    },
    btnDeleteText: { fontWeight: '600', fontSize: 14, color: COLORS.danger },

    // Filter bar
    filterBar: {
        flexDirection: 'row', justifyContent: 'flex-end', gap: 10,
        paddingHorizontal: 14, paddingVertical: 8,
    },
    filterBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line,
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    filterBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.ink },
    countBadge: {
        backgroundColor: COLORS.accent, borderRadius: 20,
        paddingHorizontal: 6, paddingVertical: 1,
    },
    countBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

    // File list
    fileRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, paddingHorizontal: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1, borderBottomColor: COLORS.line,
        borderLeftWidth: 3, borderLeftColor: 'transparent',
    },
    fileRowSelected: { backgroundColor: COLORS.accentSoft, borderLeftColor: COLORS.accent },
    fileThumb: {
        width: 50, height: 50, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: COLORS.line,
    },
    fileInfo: { flex: 1 },
    fileName: { fontWeight: '600', fontSize: 14, color: COLORS.ink },
    fileTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
    fileTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: COLORS.surfaceAlt,
        paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4,
        borderWidth: 1, borderColor: COLORS.line,
    },
    tagDotSm: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.accent },
    fileTagText: { fontSize: 10.5, color: COLORS.ink },
    fileDate: { fontSize: 11, color: COLORS.muted },

    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 14, color: COLORS.muted },

    // Modals
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: COLORS.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: 20, paddingBottom: 36,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { fontWeight: '700', fontSize: 17, color: COLORS.ink, marginBottom: 14 },
    modalOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8,
    },
    modalOptionActive: { backgroundColor: COLORS.accentSoft },
    modalOptionText: { fontSize: 14.5, color: COLORS.ink },
    modalOptionTextActive: { color: COLORS.accent, fontWeight: '600' },
    checkMark: { fontSize: 16, color: COLORS.accent, fontWeight: '700' },
    clearLink: { fontSize: 13, color: COLORS.danger, textDecorationLine: 'underline' },
    tagOptionRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 10, paddingHorizontal: 8, borderRadius: 6,
    },
    tagOptionText: { fontSize: 14, color: COLORS.ink },
    checkbox: {
        width: 20, height: 20, borderRadius: 4, borderWidth: 2,
        borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
    checkboxTick: { fontSize: 12, color: '#fff', fontWeight: '700' },
});
