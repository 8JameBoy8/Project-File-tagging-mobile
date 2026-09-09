// app/(app)/(tabs)/home.tsx
// ดู src/app/user/home/page.tsx ฝั่งเว็บสำหรับ behavior ต้นแบบ
// Endpoints: GET /api/files?sort=...&tagId=..., GET /api/tags,
// POST /api/files/[id]/verify-password, GET /api/files/[id]/download, DELETE /api/files/[id]
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { apiFetch, ApiError, resolveApiUrl } from '@/lib/api';
import { getToken } from '@/lib/storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { FileItem, Tag } from '@/types';
import TextField from '@/components/TextField';
import { AuthedVideoPlayer } from '@/components/AuthedVideoPlayer';
import { AuthedAudioPlayer } from '@/components/AuthedAudioPlayer';
import { AuthedThumbnail } from '@/components/AuthedThumbnail';
import { useLanguage, type TranslationKey } from '@/context/LanguageContext';

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

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [sortMode, setSortMode] = useState('date-desc');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  // ไฟล์ที่มีรหัสผ่านและเพิ่งปลดล็อกแล้ว (เฉพาะรอบเปิดแอปนี้ ปิดแล้วเปิดใหม่ต้องกรอกใหม่ — เหมือนฝั่งเว็บ)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTags = useCallback(async () => {
    try {
      const data = await apiFetch<Tag[]>('/api/tags');
      setTags(data);
    } catch {
      // โหลด tag ไม่สำเร็จ — ปล่อย list ว่างไว้ ไม่ block การดูไฟล์
    }
  }, []);

  const loadFiles = useCallback(async () => {
    let url = `/api/files?sort=${sortMode}`;
    activeTags.forEach((id) => {
      url += `&tagId=${id}`;
    });
    try {
      const data = await apiFetch<FileItem[]>(url);
      setFiles(data);
    } catch {
      // เงียบไว้ — ปล่อย list เดิมค้าง ดีกว่าเคลียร์ทิ้งหมดตอนเน็ตสะดุดชั่วคราว
    }
  }, [sortMode, activeTags]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadFiles();
      setLoading(false);
    })();
  }, [loadFiles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  const toggleFilterTag = (id: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openFile = (file: FileItem) => {
    setSelectedFile(file);
    setPasswordInput('');
    setPasswordError('');
  };

  const closeFile = () => setSelectedFile(null);

  const handleVerifyPassword = async () => {
    if (!selectedFile) return;
    setVerifying(true);
    setPasswordError('');
    try {
      await apiFetch(`/api/files/${selectedFile.id}/verify-password`, {
        method: 'POST',
        body: { password: passwordInput },
      });
      setUnlockedIds((prev) => new Set(prev).add(selectedFile.id));
      setPasswordInput('');
    } catch (e) {
      setPasswordError(e instanceof ApiError ? e.message : t('home_password_incorrect'));
    } finally {
      setVerifying(false);
    }
  };

  // ดาวน์โหลดไฟล์จริงมาเก็บในเครื่องก่อน (ต้องแนบ Authorization header เอง เพราะ endpoint นี้ต้อง
  // ล็อกอินถึงจะเรียกได้ — ต่างจาก URL รูปธรรมดา) แล้วเปิด share sheet ของระบบให้ผู้ใช้เลือกว่าจะ
  // เซฟลงไหน (แกลเลอรี/Files/ส่งต่อแอปอื่น ฯลฯ) — มือถือไม่มีโฟลเดอร์ "Downloads" ให้เขียนไฟล์ตรงๆ
  // ถาวรแบบเว็บ (expo-file-system เขียนได้แค่พื้นที่ private ของแอปเอง) ต้องผ่าน share sheet ถึงจะ
  // ให้ผู้ใช้เซฟแบบถาวรที่เข้าถึงได้เองได้จริง
  const handleDownload = async () => {
    if (!selectedFile) return;
    setDownloading(true);
    try {
      const token = await getToken();
      const destination = new File(Paths.cache, selectedFile.name);
      const downloaded = await File.downloadFileAsync(
        resolveApiUrl(`/api/files/${selectedFile.id}/download`),
        destination,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          // idempotent: true — เผื่อเคยดาวน์โหลดไฟล์ชื่อเดียวกันไว้ในแคชจากรอบก่อนแล้ว ไม่ต้อง error ทับ
          idempotent: true,
        }
      );

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloaded.uri);
      } else {
        Alert.alert(t('home_download_success_title'), t('home_download_saved_at', { path: downloaded.uri }));
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(t('home_download_failed_title'), t('generic_error_retry'));
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedFile) return;
    Alert.alert(t('confirm_delete_title'), t('home_confirm_delete_file', { name: selectedFile.name }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete_label'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await apiFetch(`/api/files/${selectedFile.id}`, { method: 'DELETE' });
            setSelectedFile(null);
            loadFiles();
          } catch (e) {
            Alert.alert(t('manage_tag_delete_failed_title'), e instanceof ApiError ? e.message : t('generic_error_short'));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const isLocked = !!selectedFile?.hasPassword && !unlockedIds.has(selectedFile.id);
  const getTagColor = (tagName: string) => tags.find((tg) => tg.name === tagName)?.color || '#94A3B8';
  const sortLabel = t(SORT_KEYS.find((s) => s.key === sortMode)?.labelKey ?? 'sort_newest');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.toolbarBtnText}>{t('sort_label')}: {sortLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.toolbarBtnText}>{t('filter_tag_label')}</Text>
          {activeTags.size > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeTags.size}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.fileCountText}>{t('files_count', { count: files.length })}</Text>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={files.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_files_found')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openFile(item)} activeOpacity={0.7}>
            <View style={styles.rowThumb}>
              {item.hasPassword ? (
                <Text style={styles.rowIconText}>🔒</Text>
              ) : item.type === 'image' ? (
                <AuthedThumbnail file={item} style={styles.rowThumbImage} />
              ) : (
                <Text style={styles.rowIconText}>{fileIcon(item.type)}</Text>
              )}
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {item.tags.slice(0, 3).map((tagName) => (
                    <Text key={tagName} style={styles.tagChip} numberOfLines={1}>
                      {tagName}
                    </Text>
                  ))}
                </View>
              )}
            </View>
            <Text style={styles.rowDate}>
              {new Date(item.uploadedAt).toLocaleDateString(language === 'TH' ? 'th-TH' : 'en-US')}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ===== Modal: รายละเอียดไฟล์ (preview + download/delete) ===== */}
      {/* โครงนี้ต่างจาก modal อื่นในหน้านี้ (sort/filter) ตรงที่ "ปุ่มปิดตอนแตะพื้นหลัง" ต้องแยกเป็น
          sibling ที่วางไว้ข้างหลัง ไม่ครอบ detailCard เป็น parent เหมือน modal อื่น — ลองแบบครอบ
          เป็น parent ไปแล้วเจอว่าปุ่มควบคุมของ VideoView (native component ล้วนๆ ไม่ใช่ Touchable
          ของ RN) แตะไม่ติดเลย เพราะ TouchableOpacity ที่ครอบเป็น parent ไปแย่ง touch responder จาก
          native view ลูกก่อนเสมอ (ปัญหานี้ไม่เกิดกับปุ่ม/text input ธรรมดาเพราะเป็น Touchable ของ RN
          เองที่เจรจา responder กันได้ปกติ) แยกเป็น sibling ข้างหลังแทนทำให้ detailCard และลูกๆ
          (รวม VideoView) รับ touch ของตัวเองได้ตามปกติ ส่วนพื้นที่นอก detailCard ยังกดปิด modal ได้เหมือนเดิม */}
      <Modal visible={!!selectedFile} transparent animationType="slide" onRequestClose={closeFile}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeFile} />
          <View style={styles.detailCard}>
            {selectedFile && (
              <>
                <View style={styles.previewBox}>
                  {isLocked ? (
                    <View style={styles.lockedBox}>
                      <Text style={styles.lockedIcon}>🔒</Text>
                      <Text style={styles.lockedText}>{t('home_locked_msg')}</Text>
                      <TextField
                        label={t('home_file_password_label')}
                        labelStyle={styles.lockedInputLabel}
                        style={styles.lockedInput}
                        placeholder={t('home_password_placeholder')}
                        value={passwordInput}
                        onChangeText={setPasswordInput}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                      {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                      <TouchableOpacity
                        style={styles.unlockBtn}
                        onPress={handleVerifyPassword}
                        disabled={verifying}
                      >
                        <Text style={styles.unlockBtnText}>{verifying ? '...' : t('home_unlock_btn')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : selectedFile.type === 'image' ? (
                    <AuthedThumbnail file={selectedFile} style={styles.previewImage} resizeMode="contain" />
                  ) : selectedFile.type === 'video' ? (
                    <AuthedVideoPlayer src={selectedFile.src} style={styles.previewImage} />
                  ) : selectedFile.type === 'audio' ? (
                    <AuthedAudioPlayer src={selectedFile.src} />
                  ) : (
                    <Text style={styles.previewFallback}>.{selectedFile.ext} FILE</Text>
                  )}
                </View>

                <Text style={styles.detailName} numberOfLines={2}>
                  {selectedFile.name}
                </Text>

                <View style={styles.detailTagRow}>
                  {selectedFile.tags.length > 0 ? (
                    selectedFile.tags.map((tagName) => (
                      <View key={tagName} style={styles.detailTagChip}>
                        <View style={[styles.detailTagDot, { backgroundColor: getTagColor(tagName) }]} />
                        <Text style={styles.detailTagText}>{tagName}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.detailNoTags}>{t('home_no_tags')}</Text>
                  )}
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} disabled={downloading}>
                    <Text style={styles.downloadBtnText}>
                      {downloading ? t('home_downloading') : t('home_download_btn')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                    <Text style={styles.deleteBtnText}>{deleting ? t('home_deleting') : t('delete_label')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
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
                onPress={() => {
                  setSortMode(opt.key);
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.modalRowText, sortMode === opt.key && styles.modalRowTextActive]}>
                  {t(opt.labelKey)}
                </Text>
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
            <TouchableOpacity onPress={() => setActiveTags(new Set())}>
              <Text style={styles.clearLink}>{t('clear_filter_link')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, flexWrap: 'wrap' },
  toolbarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  toolbarBtnText: { fontSize: 12.5, fontWeight: '600', color: '#374151' },
  badge: { backgroundColor: '#0284c7', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fileCountText: { fontSize: 12, color: '#6b7280', marginLeft: 'auto' },

  list: { paddingHorizontal: 14, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: 30 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  rowThumb: {
    width: 56, height: 56, borderRadius: 8, backgroundColor: '#eef1f4', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  rowThumbImage: { width: '100%', height: '100%' },
  rowIconText: { fontSize: 24 },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#111' },
  rowDate: { fontSize: 11, color: '#9ca3af' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  tagChip: {
    fontSize: 9.5, color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: 20,
    paddingHorizontal: 6, paddingVertical: 2, maxWidth: 100,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 32, maxHeight: '70%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 10 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  modalRowText: { flex: 1, fontSize: 14, color: '#111' },
  modalRowTextActive: { color: '#0284c7', fontWeight: '700' },
  modalRowCheck: { color: '#16a34a', fontWeight: '800' },
  modalDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#cbd5e1' },
  checkboxChecked: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  clearLink: { fontSize: 12.5, color: '#6b7280', textDecorationLine: 'underline', marginTop: 4 },

  detailCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20,
    paddingBottom: 32, maxHeight: '85%', gap: 14,
  },
  previewBox: {
    width: '100%', height: 220, backgroundColor: '#0F1614', borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  previewFallback: { color: '#fff', fontSize: 18, fontWeight: '800' },
  lockedBox: { width: '100%', paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  lockedIcon: { fontSize: 30 },
  lockedText: { color: '#e5e7eb', fontSize: 13, textAlign: 'center' },
  // ช่องกรอกรหัสผ่านอยู่บนพื้นหลังสีเข้ม (กล่อง preview) — ดีฟอลต์ของ TextField ใช้ตัวหนังสือ/ป้าย
  // ชื่อสีเข้ม (#111) กลืนไปกับพื้นจนมองไม่เห็นตัวที่พิมพ์เลย (เจอจริงตอนทดสอบบนมือถือ) ต้อง override
  // เป็นสีอ่อนแทน พร้อมพื้นหลัง/ขอบช่องให้ตัดกับพื้นหลังเข้มชัดขึ้นด้วย
  lockedInputLabel: { color: '#e5e7eb' },
  lockedInput: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)' },
  errorText: { color: '#f87171', fontSize: 12 },
  unlockBtn: { backgroundColor: '#0284c7', borderRadius: 8, paddingHorizontal: 22, paddingVertical: 10 },
  unlockBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  detailName: { fontSize: 15, fontWeight: '700', color: '#111', textAlign: 'center' },
  detailTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  detailTagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f9fafb', borderWidth: 1,
    borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  detailTagDot: { width: 8, height: 8, borderRadius: 4 },
  detailTagText: { fontSize: 12, color: '#111' },
  detailNoTags: { fontSize: 12.5, color: '#9ca3af' },

  detailActions: { flexDirection: 'row', gap: 10 },
  downloadBtn: {
    flex: 1, backgroundColor: '#dcfce7', borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  downloadBtnText: { color: '#15803d', fontWeight: '700', fontSize: 14 },
  deleteBtn: {
    flex: 1, backgroundColor: '#fee2e2', borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
