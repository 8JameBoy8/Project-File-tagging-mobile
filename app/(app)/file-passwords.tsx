// app/(app)/file-passwords.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { apiFetch, ApiError } from '@/lib/api';
import { FileItem, Tag } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

// ============================================================
// Gate: ยืนยันรหัสผ่านบัญชีก่อนเข้าหน้านี้
// ============================================================
function VerifyGate({ onVerified }: { onVerified: () => void }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setError('');
    if (!password) { setError(t('password_empty')); return; }
    setSubmitting(true);
    try {
      await apiFetch('/api/profile/verify-password', { method: 'POST', body: { password } });
      onVerified();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('password_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={gateStyles.container}>
      <View style={gateStyles.card}>
        <Text style={gateStyles.icon}>🔐</Text>
        <Text style={gateStyles.title}>{t('verify_title')}</Text>
        <Text style={gateStyles.subtitle}>{t('verify_subtitle')}</Text>
        <TextField
          label={t('account_password')}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={gateStyles.errorText}>{error}</Text> : null}
        <PrimaryButton
          title={submitting ? t('verifying_btn') : t('verify_btn')}
          onPress={handleVerify}
          loading={submitting}
        />
      </View>
    </View>
  );
}

const gateStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 22, gap: 14, alignItems: 'center', elevation: 2 },
  icon: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
});

// ============================================================
// Main list — หลังผ่าน gate แล้ว
// ============================================================
type TagMap = Record<string, Tag>; // tagName → Tag

export default function FilePasswordsScreen() {
  const { t } = useLanguage();
  const [verified, setVerified] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [tagMap, setTagMap] = useState<TagMap>({});
  const [loading, setLoading] = useState(false);

  // reveal state: fileId → password string | null
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [revealing, setRevealing] = useState<Record<string, boolean>>({});

  // change password modal
  const [changeTarget, setChangeTarget] = useState<FileItem | null>(null);
  const [newFilePassword, setNewFilePassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [changeError, setChangeError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // GET /api/files และ GET /api/tags คืน array ตรงๆ ไม่มี wrapper object ({files:[...]}/
      // {tags:[...]}) — ของเดิมคาดหวัง wrapper ที่ไม่มีจริง เลยได้ [] ว่างเปล่าตลอด (หน้านี้เลย
      // โชว์ "ไม่มีไฟล์" อยู่ตลอดแม้จะมีไฟล์ตั้งรหัสผ่านจริงอยู่ก็ตาม)
      const [filesData, tagsData] = await Promise.all([
        apiFetch<FileItem[]>('/api/files?hasPassword=true'),
        apiFetch<Tag[]>('/api/tags'),
      ]);
      setFiles(filesData ?? []);
      const map: TagMap = {};
      (tagsData ?? []).forEach((item) => { map[item.name] = item; });
      setTagMap(map);
    } catch {
      Alert.alert(t('error'), 'ไม่สามารถโหลดรายการไฟล์ได้');
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleVerified = () => {
    setVerified(true);
    loadData();
  };

  const handleReveal = async (file: FileItem) => {
    if (revealed[file.id]) {
      setRevealed((prev) => { const next = { ...prev }; delete next[file.id]; return next; });
      return;
    }
    setRevealing((prev) => ({ ...prev, [file.id]: true }));
    try {
      const data = await apiFetch<{ password: string }>(`/api/files/${file.id}/password`);
      setRevealed((prev) => ({ ...prev, [file.id]: data.password }));
    } catch (e) {
      Alert.alert(t('error'), e instanceof ApiError ? e.message : 'ดูรหัสไม่สำเร็จ');
    } finally {
      setRevealing((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  const handleChangePassword = async () => {
    if (!changeTarget) return;
    setChangeError('');
    if (!newFilePassword) { setChangeError(t('password_empty')); return; }
    setChangingPwd(true);
    try {
      await apiFetch(`/api/files/${changeTarget.id}/password`, {
        method: 'PUT',
        body: { password: newFilePassword },
      });
      setRevealed((prev) => { const next = { ...prev }; delete next[changeTarget.id]; return next; });
      setChangeTarget(null);
      setNewFilePassword('');
      Alert.alert(t('success'), 'เปลี่ยนรหัสผ่านไฟล์เรียบร้อย');
    } catch (e) {
      setChangeError(e instanceof ApiError ? e.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setChangingPwd(false);
    }
  };

  if (!verified) {
    return <VerifyGate onVerified={handleVerified} />;
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : files.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>{t('no_files_with_password')}</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.fileCard}>
              <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>

              {item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.map((tagName) => {
                    const tag = tagMap[tagName];
                    return (
                      <View
                        key={tagName}
                        style={[styles.tagChip, { backgroundColor: tag?.color ?? '#e5e7eb' }]}
                      >
                        <Text style={styles.tagText}>{tagName}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {revealed[item.id] !== undefined && (
                <View style={styles.revealedBox}>
                  <Text style={styles.revealedLabel}>{t('account_password')}: </Text>
                  <Text style={styles.revealedPassword}>{revealed[item.id]}</Text>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleReveal(item)}
                  disabled={revealing[item.id]}
                  activeOpacity={0.7}
                >
                  {revealing[item.id] ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {revealed[item.id] !== undefined ? `🙈 ${t('hide_pwd')}` : `👁 ${t('view_pwd')}`}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnOutline]}
                  onPress={() => { setChangeTarget(item); setNewFilePassword(''); setChangeError(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionBtnOutlineText}>✏️ {t('change_pwd')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal เปลี่ยนรหัสผ่านไฟล์ */}
      <Modal
        visible={!!changeTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setChangeTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('modal_change_pwd_title')}</Text>
            {changeTarget && (
              <Text style={styles.modalSubtitle} numberOfLines={1}>{changeTarget.name}</Text>
            )}
            <TextField
              label={t('new_password')}
              placeholder="••••••••"
              secureTextEntry
              value={newFilePassword}
              onChangeText={setNewFilePassword}
            />
            {changeError ? <Text style={styles.errorText}>{changeError}</Text> : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setChangeTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title={changingPwd ? t('saving') : t('save')}
                  onPress={handleChangePassword}
                  loading={changingPwd}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: '#6b7280' },

  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  fileCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fileName: { fontSize: 15, fontWeight: '700', color: '#111' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '600', color: '#111' },

  revealedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8 },
  revealedLabel: { fontSize: 12, color: '#6b7280' },
  revealedPassword: { fontSize: 13, fontWeight: '700', color: '#15803d' },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  actionBtnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  actionBtnOutlineText: { fontSize: 13, fontWeight: '600', color: '#334155' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
    paddingBottom: 36,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  modalSubtitle: { fontSize: 13, color: '#6b7280', marginTop: -4 },
  modalActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: '#64748b', fontWeight: '600' },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
});
