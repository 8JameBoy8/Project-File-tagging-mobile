// app/(auth)/login.tsx
// ตัวอย่างหน้าจอที่ต่อ API จริงครบวงจรแล้ว — ใช้ pattern นี้เป็นแบบตอนทำหน้าจออื่น
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth, ApiError } from '@/context/AuthContext';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextField
        label="Gmail"
        placeholder="Example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton title={submitting ? 'กำลังเข้าสู่ระบบ...' : 'Login'} onPress={handleSubmit} loading={submitting} />

      <View style={styles.linksRow}>
        <Link href="/(auth)/register">Register?</Link>
        <Link href="/(auth)/forgot-password">Forgot password</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: '#bce3f9' },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  error: { color: '#dc2626', textAlign: 'center' },
  linksRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});
