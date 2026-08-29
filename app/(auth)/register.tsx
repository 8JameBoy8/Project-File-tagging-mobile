// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth, ApiError } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState(''); // เก็บไว้ตั้งเป็น displayName หลัง register สำเร็จ
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password);
      if (username.trim()) {
        // ไม่ต้องรอ/ไม่ต้อง block การไปหน้าถัดไปถ้าพลาด (เหมือนฝั่งเว็บ)
        apiFetch('/api/profile', { method: 'PATCH', body: { displayName: username.trim() } }).catch(() => {});
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextField label="Username" placeholder="Your Username" value={username} onChangeText={setUsername} />
      <TextField
        label="Gmail"
        placeholder="Example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Password" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
      <TextField
        label="Confirm Password"
        placeholder="••••••••"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title={submitting ? 'กำลังสมัครสมาชิก...' : 'Sign Up'} onPress={handleSubmit} loading={submitting} />

      <View style={styles.linkRow}>
        <Text>Already have an account? </Text>
        <Link href="/(auth)/login">Login</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: '#bce3f9' },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  error: { color: '#dc2626', textAlign: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
});
