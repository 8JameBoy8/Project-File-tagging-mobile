// app/(app)/change-password.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch, ApiError } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(t('pwd_required'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('pwd_mismatch'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('pwd_too_short'));
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/api/profile/change-password', {
        method: 'POST',
        body: { oldPassword, newPassword },
      });
      setSuccessMsg(t('change_pwd_success'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => router.back(), 1500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('change_pwd_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('change_pwd_screen_title')}</Text>
        <Text style={styles.hint}>{t('change_pwd_subtitle')}</Text>

        <TextField
          label={t('current_password')}
          placeholder="••••••••"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextField
          label={t('new_password')}
          placeholder="••••••••"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextField
          label={t('confirm_new_password')}
          placeholder="••••••••"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

        <PrimaryButton
          title={submitting ? t('saving') : t('save')}
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  hint: { fontSize: 13, color: '#6b7280', marginTop: -6, marginBottom: 4 },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  successText: { color: '#16a34a', fontSize: 13, textAlign: 'center' },
});
