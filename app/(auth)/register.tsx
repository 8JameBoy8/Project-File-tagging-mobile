// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth, ApiError } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [username, setUsername] = useState(''); 
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
        apiFetch('/api/profile', { method: 'PATCH', body: { displayName: username.trim() } }).catch(() => {});
      }
      // ไม่ต้อง router.replace เอง — app/(auth)/_layout.tsx เช็ค user แล้ว redirect ให้อัตโนมัติ
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* เพิ่ม ScrollView เพื่อให้เลื่อนจอได้เวลาคีย์บอร์ดเด้งบังช่องกรอก */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* ไอคอนกลมๆ เปลี่ยนเป็นรูปกระดาษโน้ต หรือคน ให้ต่างจากหน้านิดนึง */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>📝</Text> 
          </View>

          <Text style={styles.title}>REGISTER</Text>

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

          <View style={styles.buttonWrapper}>
            <PrimaryButton title={submitting ? 'กำลังสมัครสมาชิก...' : 'Sign Up'} onPress={handleSubmit} loading={submitting} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>Login</Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#bce3f9' 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    paddingTop: 50, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
    marginTop: 40, // เผื่อที่ให้ไอคอนด้านบนไม่โดนขอบจอตัดเวลาเลื่อน
  },
  avatarContainer: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    width: 80,
    height: 80,
    backgroundColor: "#e6fafe",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarIcon: {
    fontSize: 40,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  error: { 
    color: '#dc2626', 
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonWrapper: {
    marginTop: 10,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  link: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  }
});