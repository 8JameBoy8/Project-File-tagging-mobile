// app/(app)/(tabs)/create-tag.tsx
// ดู src/app/user/create-tag/page.tsx ฝั่งเว็บสำหรับ behavior ต้นแบบ
// Endpoints: GET /api/tags, POST /api/tags { name, color }, DELETE /api/tags/[id]
// Tag เป็นของแต่ละ user แล้ว (ไม่ใช่ global) — GET /api/tags คืนแค่ tag ของตัวเอง (ดู docs/API.md)
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { apiFetch, ApiError } from '@/lib/api';
import type { Tag } from '@/types';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';
import { useLanguage } from '@/context/LanguageContext';

// สีตัวเลือกสำเร็จรูปชุดเดียวกับฝั่งเว็บ
const SWATCHES = [
  '#d9d9d9', '#ff4d4f', '#ff9c6e', '#ffc53d', '#73d13d',
  '#36cfc9', '#4096ff', '#9254de', '#f759ab', '#000000',
];

export default function CreateTagScreen() {
  const { t } = useLanguage();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadTags = useCallback(async () => {
    try {
      const data = await apiFetch<Tag[]>('/api/tags');
      setTags(data);
    } catch {
      // เงียบไว้ — ปล่อย list ว่างถ้าโหลดไม่สำเร็จ ไม่ block หน้าจอ
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('notice_title'), t('create_tag_name_required'));
      return;
    }
    setCreating(true);
    try {
      const newTag = await apiFetch<Tag>('/api/tags', {
        method: 'POST',
        body: { name: name.trim(), color },
      });
      setTags((prev) => [newTag, ...prev]);
      setName('');
      setColor(SWATCHES[0]);
    } catch (e) {
      Alert.alert(t('create_tag_create_failed_title'), e instanceof ApiError ? e.message : t('generic_error_retry'));
    } finally {
      setCreating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      Alert.alert(t('notice_title'), t('create_tag_select_before_delete'));
      return;
    }
    Alert.alert(
      t('confirm_delete_title'),
      t('create_tag_confirm_delete_msg', { count: selectedIds.size }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_label'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const ids = Array.from(selectedIds);
            // ลบทีละแท็ก (endpoint รองรับแค่ลบทีละอันเท่านั้น เหมือนฝั่งเว็บ)
            for (const id of ids) {
              try {
                await apiFetch(`/api/tags/${id}`, { method: 'DELETE' });
              } catch {
                // ลบอันไหนไม่สำเร็จก็ข้ามไป ไม่ให้ทั้งชุด fail
              }
            }
            setTags((prev) => prev.filter((t) => !selectedIds.has(t.id)));
            setSelectedIds(new Set());
            setDeleting(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <TextField label={t('create_tag_name_label')} placeholder={t('create_tag_name_placeholder')} value={name} onChangeText={setName} />

        <View style={styles.previewRow}>
          <View style={[styles.previewCircle, { backgroundColor: color }]} />
          <Text style={styles.previewName}>{name || t('create_tag_name_label')}</Text>
        </View>

        <Text style={styles.sectionLabel}>{t('color_label')}</Text>
        <View style={styles.swatchRow}>
          {SWATCHES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                color === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>

        <TextField
          label={t('create_tag_custom_color_label')}
          placeholder="#rrggbb"
          value={color}
          onChangeText={setColor}
          autoCapitalize="none"
        />

        <PrimaryButton
          title={creating ? t('create_tag_creating') : t('create_tag_submit')}
          onPress={handleCreate}
          loading={creating}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{t('create_tag_all_tags', { count: tags.length })}</Text>
        <TouchableOpacity onPress={handleDeleteSelected} disabled={deleting}>
          <Text style={[styles.deleteLink, selectedIds.size > 0 && styles.deleteLinkActive]}>
            {deleting
              ? t('create_tag_deleting')
              : selectedIds.size > 0
                ? t('create_tag_delete_selected', { count: selectedIds.size })
                : t('create_tag_select_to_delete')}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : tags.length === 0 ? (
        <Text style={styles.emptyText}>{t('create_tag_empty_hint')}</Text>
      ) : (
        <View style={styles.chipWrap}>
          {tags.map((tag) => {
            const selected = selectedIds.has(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleSelect(tag.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.chipDot, { backgroundColor: tag.color }]} />
                <Text style={styles.chipText}>{tag.name}</Text>
                {selected && <Text style={styles.chipCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  previewRow: { alignItems: 'center', gap: 8, marginVertical: 6 },
  previewCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#e5e7eb' },
  previewName: { fontSize: 14, fontWeight: '600', color: '#374151' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#111' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: '#111' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  deleteLink: { fontSize: 13, color: '#9ca3af', fontWeight: '600' },
  deleteLinkActive: { color: '#dc2626' },

  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 16 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  chipSelected: { borderColor: '#111', backgroundColor: '#f3f4f6' },
  chipDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#00000022' },
  chipText: { fontSize: 13, color: '#111' },
  chipCheck: { fontSize: 12, fontWeight: '800', color: '#16a34a', marginLeft: 2 },
});
