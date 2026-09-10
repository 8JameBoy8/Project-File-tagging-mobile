// app/(app)/(tabs)/manage-tag.tsx
// ดู src/app/user/manage-tag/page.tsx ฝั่งเว็บสำหรับ behavior ต้นแบบ
// Endpoints: GET /api/tags, PUT /api/tags/[id], DELETE /api/tags/[id],
// GET /api/files?sort=...&tagId=...&untagged=true, POST /api/tags/[id]/files { fileIds }
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { apiFetch, ApiError } from '@/lib/api';
import type { Tag, FileItem } from '@/types';
import TextField from '@/components/TextField';
import { AuthedThumbnail } from '@/components/AuthedThumbnail';
import { useLanguage, type TranslationKey } from '@/context/LanguageContext';

const NO_TAG_ID = '__no_tag__';

// ค่า key คงที่ (ไม่แปล) แต่ label ต้องคำนวณจาก t() ตอน render เพื่อให้เปลี่ยนตามภาษาที่เลือกอยู่
const SORT_KEYS: { key: string; labelKey: TranslationKey }[] = [
  { key: 'date-desc', labelKey: 'sort_newest' },
  { key: 'date-asc', labelKey: 'sort_oldest' },
  { key: 'type', labelKey: 'sort_by_type' },
  { key: 'name', labelKey: 'sort_by_name' },
];

function fileIcon(type: FileItem['type']) {
  if (type === 'document') return '📄';
  if (type === 'image') return '🖼️';
  if (type === 'video') return '🎬';
  if (type === 'audio') return '🎵';
  return '📁';
}

export default function ManageTagScreen() {
  const { t } = useLanguage();
  const [tags, setTags] = useState<Tag[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#d9d9d9');

  const [sortMode, setSortMode] = useState('date-desc');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);

  const [pickMode, setPickMode] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // ไฟล์ที่กำลังเปิดดู/ถอดแท็กอยู่ (แตะการ์ดไฟล์ตอนไม่ได้อยู่ pick mode) — เดิมไม่มีทางถอดแท็ก
  // ออกจากไฟล์เลยทั้งที่ backend (PUT /api/files/[id]/tags) รองรับ ตรงกับที่เพิ่งเพิ่มฝั่งเว็บ
  const [fileTagsModalId, setFileTagsModalId] = useState<string | null>(null);
  const [removingTag, setRemovingTag] = useState(false);

  const selectedTag = useMemo(() => tags.find((t) => t.id === selectedTagId), [tags, selectedTagId]);

  // ดึงไฟล์ตัวปัจจุบันจาก state `files` ด้วย id เสมอ เพื่อให้ modal โชว์ list แท็กล่าสุดหลังถอดแท็กออก
  const fileTagsModalFile = useMemo(
    () => files.find((f) => f.id === fileTagsModalId) ?? null,
    [files, fileTagsModalId]
  );

  const loadTags = useCallback(async () => {
    try {
      const data = await apiFetch<Tag[]>('/api/tags');
      setTags(data);
    } catch {
      // ไม่มี tag ก็แค่โชว์ list เปล่า
    }
  }, []);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    let url = `/api/files?sort=${sortMode}`;
    if (activeTags.has(NO_TAG_ID)) {
      url += '&untagged=true';
    } else {
      activeTags.forEach((id) => { url += `&tagId=${id}`; });
    }
    try {
      const data = await apiFetch<FileItem[]>(url);
      setFiles(data);
    } catch {
      // เงียบไว้
    } finally {
      setLoadingFiles(false);
    }
  }, [sortMode, activeTags]);

  useEffect(() => { loadTags(); }, [loadTags]);
  useEffect(() => { loadFiles(); }, [loadFiles]);

  // สลับ tag เป้าหมาย → รีเซ็ตฟอร์มแก้ไข + ยกเลิก pick mode ที่ค้างอยู่ (เหมือนฝั่งเว็บ)
  useEffect(() => {
    if (selectedTag) {
      setEditName(selectedTag.name);
      setEditColor(selectedTag.color);
    } else {
      setEditName('');
      setEditColor('#d9d9d9');
    }
    setIsEditing(false);
    setPickMode(false);
    setSelectedFileIds(new Set());
  }, [selectedTagId, selectedTag]);

  const handleDeleteTag = () => {
    if (!selectedTagId) {
      Alert.alert(t('notice_title'), t('manage_tag_select_tag_first'));
      return;
    }
    Alert.alert(t('confirm_delete_title'), t('manage_tag_confirm_delete_tag', { name: selectedTag?.name ?? '' }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete_label'),
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/api/tags/${selectedTagId}`, { method: 'DELETE' });
            setSelectedTagId('');
            loadTags();
            loadFiles();
          } catch (e) {
            Alert.alert(t('manage_tag_delete_failed_title'), e instanceof ApiError ? e.message : t('generic_error_short'));
          }
        },
      },
    ]);
  };

  const handleUpdateTag = async () => {
    if (!selectedTagId) return;
    try {
      await apiFetch(`/api/tags/${selectedTagId}`, {
        method: 'PUT',
        body: { name: editName, color: editColor },
      });
      setIsEditing(false);
      loadTags();
    } catch (e) {
      Alert.alert(t('manage_tag_save_failed_title'), e instanceof ApiError ? e.message : t('generic_error_short'));
    }
  };

  const toggleFilterTag = (id: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (id === NO_TAG_ID) {
        if (next.has(NO_TAG_ID)) next.delete(NO_TAG_ID);
        else { next.clear(); next.add(NO_TAG_ID); }
      } else {
        next.delete(NO_TAG_ID);
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  };

  const startPickMode = () => {
    if (!selectedTagId) {
      Alert.alert(t('notice_title'), t('manage_tag_select_tag_first'));
      return;
    }
    setPickMode(true);
    setSelectedFileIds(new Set());
  };

  const cancelPickMode = () => {
    setPickMode(false);
    setSelectedFileIds(new Set());
  };

  const toggleFileSelection = (file: FileItem) => {
    if (!pickMode) return;
    if (selectedTag && file.tags.includes(selectedTag.name)) return; // มีแท็กนี้อยู่แล้ว แตะไม่ได้
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(file.id)) next.delete(file.id);
      else next.add(file.id);
      return next;
    });
  };

  const handleConfirmAdd = async () => {
    if (selectedFileIds.size === 0) {
      Alert.alert(t('notice_title'), t('manage_tag_select_one_file'));
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/tags/${selectedTagId}/files`, {
        method: 'POST',
        body: { fileIds: Array.from(selectedFileIds) },
      });
      setPickMode(false);
      setSelectedFileIds(new Set());
      loadFiles();
    } catch (e) {
      Alert.alert(t('manage_tag_add_failed_title'), e instanceof ApiError ? e.message : t('generic_error_short'));
    } finally {
      setSaving(false);
    }
  };

  // ถอดแท็ก 1 อันออกจากไฟล์ — PUT ทั้ง list แท็กที่เหลือกลับไป (endpoint นี้ replace ทั้งชุด
  // ไม่ได้ลบทีละอัน) เหมือน handleRemoveTagFromFile ฝั่งเว็บ
  const handleRemoveTagFromFile = (file: FileItem, tagName: string) => {
    Alert.alert(
      t('manage_tag_remove_tag_action'),
      t('manage_tag_remove_tag_confirm', { name: tagName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('manage_tag_remove_tag_action'),
          style: 'destructive',
          onPress: async () => {
            const remainingTagIds = file.tags
              .filter((name) => name !== tagName)
              .map((name) => tags.find((tg) => tg.name === name)?.id)
              .filter((id): id is string => !!id);
            setRemovingTag(true);
            try {
              await apiFetch(`/api/files/${file.id}/tags`, {
                method: 'PUT',
                body: { tagIds: remainingTagIds },
              });
              await loadFiles();
            } catch (e) {
              Alert.alert(
                t('manage_tag_remove_failed_title'),
                e instanceof ApiError ? e.message : t('generic_error_short')
              );
            } finally {
              setRemovingTag(false);
            }
          },
        },
      ]
    );
  };

  const sortLabel = t(SORT_KEYS.find((s) => s.key === sortMode)?.labelKey ?? 'sort_newest');

  return (
    <View style={styles.container}>
      {/* ===== แถวควบคุมด้านบน: เลือก/แก้ไข/ลบแท็ก + เข้าโหมดเลือกไฟล์ ===== */}
      <View style={styles.topBar}>
        {/* ซ่อนปุ่มเลือกแท็กตอนอยู่ใน pick mode — เลือกแท็กเป้าหมายล็อกไว้แล้วตอนกดเข้าโหมดนี้
            ไม่ต้องโชว์ซ้ำ ให้พื้นที่แถวทั้งหมดกับปุ่มยืนยัน/ยกเลิกแทน (เดิมโชว์พร้อมกันสองฝั่ง ทำให้
            ปุ่ม "ยกเลิก" ถูกดันตกขอบจอบนมือถือหน้าจอแคบ — เจอจริงตอนทดสอบบนเครื่อง) */}
        {!pickMode && (
          <TouchableOpacity style={styles.tagPickerButton} onPress={() => setTagPickerVisible(true)}>
            <Text style={styles.tagPickerText} numberOfLines={1}>
              {selectedTag ? selectedTag.name : t('manage_tag_select_prompt')}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        )}

        {selectedTagId && !isEditing && !pickMode && (
          <>
            <View style={[styles.colorDot, { backgroundColor: selectedTag?.color }]} />
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditing(true)}>
              <Text>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleDeleteTag}>
              <Text>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={startPickMode}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </>
        )}

        {pickMode && (
          <View style={styles.pickModeControls}>
            <Text style={styles.pickCount}>{t('manage_tag_selected_count', { count: selectedFileIds.size })}</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAdd} disabled={saving}>
              <Text style={styles.confirmBtnText}>{saving ? '...' : t('manage_tag_confirm_action')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancelPickMode}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isEditing && (
        <View style={styles.editRow}>
          <View style={{ flex: 1 }}>
            <TextField label={t('manage_tag_name_label')} placeholder={t('create_tag_name_label')} value={editName} onChangeText={setEditName} />
          </View>
          <TextField
            label={t('color_label')}
            placeholder="#rrggbb"
            value={editColor}
            onChangeText={setEditColor}
            autoCapitalize="none"
            style={{ width: 90 }}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateTag}>
            <Text style={styles.confirmBtnText}>{t('save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== แถว sort / filter / จำนวนไฟล์ ===== */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.toolbarBtnText}>{t('sort_label')}: {sortLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.toolbarBtnText}>{t('filter_tag_label')}</Text>
          {activeTags.size > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{activeTags.size}</Text></View>
          )}
        </TouchableOpacity>
        <Text style={styles.fileCountText}>{t('files_count', { count: files.length })}</Text>
      </View>

      {pickMode && (
        <Text style={styles.pickHint}>
          {t('manage_tag_pick_hint', { name: selectedTag ? `"${selectedTag.name}"` : '' })}
        </Text>
      )}

      {/* ===== Grid ไฟล์ ===== */}
      {loadingFiles ? (
        <ActivityIndicator style={{ marginTop: 30 }} size="large" />
      ) : (
        <FlatList
          data={files}
          key="grid-2col"
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('no_files_found')}</Text>}
          renderItem={({ item }) => {
            const alreadyTagged = !!selectedTag && item.tags.includes(selectedTag.name);
            const isSelected = selectedFileIds.has(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.fileCard,
                  isSelected && styles.fileCardSelected,
                  pickMode && alreadyTagged && styles.fileCardDisabled,
                ]}
                onPress={() => (pickMode ? toggleFileSelection(item) : setFileTagsModalId(item.id))}
                disabled={pickMode && alreadyTagged}
                activeOpacity={0.7}
              >
                {pickMode && (
                  <View style={[styles.selectDot, isSelected && styles.selectDotActive]}>
                    {isSelected && <Text style={styles.selectDotCheck}>✓</Text>}
                  </View>
                )}
                {alreadyTagged && (
                  <View style={styles.taggedBadge}>
                    <Text style={styles.taggedBadgeText}>{t('already_tagged_label')}</Text>
                  </View>
                )}
                <View style={styles.thumbnail}>
                  {item.hasPassword ? (
                    <Text style={styles.cardIcon}>🔒</Text>
                  ) : item.type === 'image' ? (
                    <AuthedThumbnail file={item} style={styles.thumbnailImage} />
                  ) : (
                    <Text style={styles.cardIcon}>{fileIcon(item.type)}</Text>
                  )}
                </View>
                <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                {item.tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.tags.slice(0, 2).map((tagName) => (
                      <Text key={tagName} style={styles.tagChip} numberOfLines={1}>{tagName}</Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ===== Modal: เลือกแท็กเป้าหมาย ===== */}
      <Modal visible={tagPickerVisible} transparent animationType="slide" onRequestClose={() => setTagPickerVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTagPickerVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('select_tag_title')}</Text>
            {tags.length === 0 ? (
              <Text style={styles.emptyText}>{t('manage_tag_create_tag_first')}</Text>
            ) : (
              tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.modalRow}
                  onPress={() => { setSelectedTagId(tag.id); setTagPickerVisible(false); }}
                >
                  <View style={[styles.colorDot, { backgroundColor: tag.color }]} />
                  <Text style={styles.modalRowText}>{tag.name}</Text>
                  {tag.id === selectedTagId && <Text style={styles.modalRowCheck}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== Modal: เรียงลำดับ ===== */}
      <Modal visible={sortModalVisible} transparent animationType="slide" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('sort_label')}</Text>
            {SORT_KEYS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalRow}
                onPress={() => { setSortMode(opt.key); setSortModalVisible(false); }}
              >
                <Text style={[styles.modalRowText, sortMode === opt.key && styles.modalRowTextActive]}>{t(opt.labelKey)}</Text>
                {sortMode === opt.key && <Text style={styles.modalRowCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== Modal: กรองแท็ก ===== */}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('filter_by_tag_title')}</Text>
            {tags.map((tag) => (
              <TouchableOpacity key={tag.id} style={styles.modalRow} onPress={() => toggleFilterTag(tag.id)}>
                <View style={[styles.checkbox, activeTags.has(tag.id) && styles.checkboxChecked]} />
                <Text style={styles.modalRowText}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
            {tags.length === 0 && <Text style={styles.emptyText}>{t('no_tags_yet')}</Text>}
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalRow} onPress={() => toggleFilterTag(NO_TAG_ID)}>
              <View style={[styles.checkbox, activeTags.has(NO_TAG_ID) && styles.checkboxChecked]} />
              <Text style={styles.modalRowText}>{t('untagged_files_label')}</Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity onPress={() => setActiveTags(new Set())}>
              <Text style={styles.clearLink}>{t('clear_filter_link')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== Modal: แท็กของไฟล์ (แตะเพื่อถอดออก) ===== */}
      <Modal
        visible={fileTagsModalFile !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setFileTagsModalId(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFileTagsModalId(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {fileTagsModalFile?.name}
            </Text>
            <Text style={styles.modalSubtitle}>{t('manage_tag_file_tags_title')}</Text>
            {fileTagsModalFile && fileTagsModalFile.tags.length > 0 ? (
              <>
                <Text style={styles.pickHint}>{t('manage_tag_tap_tag_to_remove')}</Text>
                <View style={styles.fileTagWrap}>
                  {fileTagsModalFile.tags.map((tagName) => (
                    <TouchableOpacity
                      key={tagName}
                      style={styles.fileTagChip}
                      disabled={removingTag}
                      onPress={() => handleRemoveTagFromFile(fileTagsModalFile, tagName)}
                    >
                      <Text style={styles.fileTagChipText}>{tagName}</Text>
                      <Text style={styles.fileTagChipX}>✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>{t('manage_tag_no_tags_on_file')}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, flexWrap: 'wrap' },
  tagPickerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 140,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  tagPickerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111' },
  chevron: { color: '#9ca3af' },
  colorDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#e5e7eb' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1,
    borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#0284c7',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 20 },

  pickModeControls: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' },
  pickCount: { fontSize: 12, color: '#6b7280', flex: 1 },
  confirmBtn: { backgroundColor: '#dcfce7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  confirmBtnText: { color: '#15803d', fontWeight: '700', fontSize: 13 },
  cancelBtn: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  cancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 13 },

  editRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 14, paddingBottom: 10, flexWrap: 'wrap' },

  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 10, flexWrap: 'wrap' },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  toolbarBtnText: { fontSize: 12.5, fontWeight: '600', color: '#374151' },
  badge: { backgroundColor: '#0284c7', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fileCountText: { fontSize: 12, color: '#6b7280', marginLeft: 'auto' },

  pickHint: { fontSize: 12, color: '#6b7280', paddingHorizontal: 14, paddingBottom: 8 },

  grid: { padding: 10, paddingBottom: 40 },
  gridRow: { gap: 10, marginBottom: 10 },
  fileCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 2,
    borderColor: '#e5e7eb', minHeight: 170,
  },
  fileCardSelected: { borderColor: '#0284c7' },
  fileCardDisabled: { opacity: 0.5 },
  thumbnail: {
    flex: 1, backgroundColor: '#eef1f4', borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', marginBottom: 8, overflow: 'hidden',
  },
  thumbnailImage: { width: '100%', height: '100%' },
  cardIcon: { fontSize: 34 },
  fileName: { fontSize: 12.5, fontWeight: '600', color: '#111', textAlign: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 6 },
  tagChip: { fontSize: 9.5, color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2, maxWidth: 80 },

  selectDot: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff', alignItems: 'center',
    justifyContent: 'center', zIndex: 2,
  },
  selectDotActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  selectDotCheck: { color: '#fff', fontSize: 11, fontWeight: '800' },
  taggedBadge: {
    position: 'absolute', top: 8, left: 8, backgroundColor: '#e0f2fe', borderRadius: 20,
    paddingHorizontal: 6, paddingVertical: 2, zIndex: 2,
  },
  taggedBadgeText: { fontSize: 8.5, color: '#0284c7', fontWeight: '700' },

  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 30 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 32, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 10 },
  modalSubtitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fileTagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  fileTagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9',
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingLeft: 12, paddingRight: 10, paddingVertical: 7,
  },
  fileTagChipText: { fontSize: 13, color: '#111', fontWeight: '600' },
  fileTagChipX: { fontSize: 12, color: '#dc2626', fontWeight: '800' },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  modalRowText: { flex: 1, fontSize: 14, color: '#111' },
  modalRowTextActive: { color: '#0284c7', fontWeight: '700' },
  modalRowCheck: { color: '#16a34a', fontWeight: '800' },
  modalDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#cbd5e1' },
  checkboxChecked: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  clearLink: { fontSize: 12.5, color: '#6b7280', textDecorationLine: 'underline', marginTop: 4 },
});
