// app/(app)/profile.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiFetch, ApiError } from '@/lib/api';
import { saveAvatarUri, getAvatarUri, clearAvatarUri } from '@/lib/storage';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

type StorageInfo = { usedBytes: number; limitBytes: number };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ProfileScreen() {
  const { user, avatarUri, updateAvatarUri, refreshUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadStorage = useCallback(async () => {
    try {
      const data = await apiFetch<{ usedBytes: number; limitBytes: number }>('/api/profile/storage');
      setStorage(data);
    } catch {
      // ไม่แสดง error ถ้าโหลด storage ไม่ได้ — ไม่ block การใช้งานหน้า
    } finally {
      setLoadingStorage(false);
    }
  }, []);

  useEffect(() => {
    loadStorage();
  }, [loadStorage]);

  // ฟังก์ชันเลือกรูปจากคลังภาพ
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        await updateAvatarUri(uri);

        // ซิงค์กับ backend (ถ้ามี endpoint avatar)
        try {
          const formData = new FormData();
          formData.append('avatar', {
            uri,
            name: 'avatar.jpg',
            type: 'image/jpeg',
          } as any);
          await apiFetch('/api/profile/avatar', {
            method: 'POST',
            body: formData,
          });
          await refreshUser();
        } catch {
          // ถ้า backend ยังไม่มี endpoint นี้ รูปจะยังคงแสดงจาก storage ในเครื่อง
        }
      }
    } catch {
      Alert.alert(t('error'), 'ไม่สามารถเปิดคลังรูปภาพได้');
    }
  };

  const handleRemoveAvatar = async () => {
    await updateAvatarUri(null);
  };

  const handleAvatarPress = () => {
    Alert.alert(t('change_photo'), t('tap_to_change_photo'), [
      { text: t('choose_from_gallery'), onPress: handlePickImage },
      ...(avatarUri ? [{ text: t('remove_photo'), style: 'destructive' as const, onPress: handleRemoveAvatar }] : []),
      { text: t('cancel'), style: 'cancel' as const },
    ]);
  };

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      await apiFetch('/api/profile', {
        method: 'PATCH',
        body: { displayName: displayName.trim() },
      });
      await refreshUser();
      setSuccessMsg(t('profile_save_success'));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('profile_save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const usedPercent =
    storage && storage.limitBytes > 0
      ? Math.min((storage.usedBytes / storage.limitBytes) * 100, 100)
      : 0;

  const initial = (displayName || user?.displayName || user?.email || '?')[0].toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={handleAvatarPress} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}

          {/* Camera Badge */}
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAvatarPress}>
          <Text style={styles.changePhotoText}>{t('change_photo')}</Text>
        </TouchableOpacity>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('personal_info')}</Text>
        <TextField
          label={t('display_name')}
          placeholder={t('display_name_placeholder')}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextField
          label={t('email')}
          value={user?.email ?? ''}
          editable={false}
          style={styles.disabledInput}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}
        <PrimaryButton
          title={saving ? t('saving_profile_btn') : t('save_profile_btn')}
          onPress={handleSave}
          loading={saving}
        />
      </View>

      {/* Storage */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('storage_section')}</Text>
        {loadingStorage ? (
          <ActivityIndicator />
        ) : storage ? (
          <>
            <View style={styles.storageBar}>
              <View style={[styles.storageBarFill, { width: `${usedPercent}%` as any }]} />
            </View>
            <Text style={styles.storageText}>
              {formatBytes(storage.usedBytes)} / {formatBytes(storage.limitBytes)}{' '}
              ({usedPercent.toFixed(1)}%)
            </Text>
          </>
        ) : (
          <Text style={styles.mutedText}>{t('storage_error')}</Text>
        )}
      </View>

      {/* Security */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('security_section')}</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/(app)/change-password')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>🔒  {t('change_password_btn')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: '#fff' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0284c7',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    elevation: 3,
  },
  cameraIcon: { fontSize: 15 },
  changePhotoText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2,
  },
  emailText: { fontSize: 13, color: '#6b7280' },

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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  disabledInput: { backgroundColor: '#f3f4f6', color: '#9ca3af' },

  storageBar: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: '#0284c7', borderRadius: 5 },
  storageText: { fontSize: 12, color: '#6b7280' },
  mutedText: { fontSize: 13, color: '#9ca3af' },

  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  linkText: { fontSize: 15, fontWeight: '600', color: '#111' },
  chevron: { fontSize: 20, color: '#9ca3af' },

  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  successText: { color: '#16a34a', fontSize: 13, textAlign: 'center' },
});
