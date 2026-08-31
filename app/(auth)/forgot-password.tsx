// app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter(); // ตัวช่วยสำหรับเปลี่ยนหน้า

  const handleSubmit = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมล');
      return;
    }

    setError('');
    setSubmitting(true);
    
    try {
      // 1. ส่งอีเมลไปขอ OTP ตามที่เพื่อนคอมเมนต์บอก
      await apiFetch('/api/auth/forget-password', {
        method: 'POST',
        body: { email: email.trim() }
      });

      // 2. ถ้าสำเร็จ ให้เด้งไปหน้า change-password พร้อมแนบ email ไปด้วย
      router.push({
        pathname: '/(auth)/change-password',
        params: { email: email.trim() }
      });

    } catch (e: any) {
      // ดักจับ Error เผื่ออีเมลไม่มีในระบบ
      setError(e.message || 'ไม่สามารถส่งคำร้องขอได้ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        
        {/* ไอคอนแม่กุญแจ */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarIcon}>🔐</Text>
        </View>

        <Text style={styles.title}>FORGOT PASSWORD</Text>
        <Text style={styles.subtitle}>กรุณากรอกอีเมลของคุณเพื่อรับรหัส OTP สำหรับตั้งรหัสผ่านใหม่</Text>

        <TextField
          label="Gmail"
          placeholder="Example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonWrapper}>
          <PrimaryButton 
            title={submitting ? 'กำลังส่งข้อมูล...' : 'Send OTP'} 
            onPress={handleSubmit} 
            loading={submitting} 
          />
        </View>

        <View style={styles.footer}>
          <Link href="/(auth)/login" style={styles.link}>⬅ กลับไปหน้า Login</Link>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24, 
    backgroundColor: '#bce3f9' 
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
    fontSize: 35,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
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
  link: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  }
});