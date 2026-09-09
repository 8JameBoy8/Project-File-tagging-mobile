// app/(auth)/change-password.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '@/lib/api';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function ChangePasswordScreen() {
  const router = useRouter();
  // รับค่า email ที่ถูกส่งข้ามหน้ามาจาก forgot-password
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    // ดักจับข้อมูลก่อนส่ง
    if (!otp) {
      setError('กรุณากรอกรหัส OTP');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setSubmitting(true);
    
    try {
      // ยิง API ไปเปลี่ยนรหัสผ่านตามที่เพื่อนเขียนบอก
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: { 
          email: email, 
          otp: otp, 
          newPassword: newPassword 
        }
      });

      // ถ้าสำเร็จ โชว์แจ้งเตือนแล้วเด้งกลับไปหน้า Login
      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่', [
        { text: 'ตกลง', onPress: () => router.replace('/(auth)/login') }
      ]);

    } catch (e: any) {
      setError(e.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ รหัส OTP อาจไม่ถูกต้อง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          {/* ไอคอนกุญแจ */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>🔑</Text>
          </View>

          <Text style={styles.title}>RESET PASSWORD</Text>
          <Text style={styles.subtitle}>
            กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมล{"\n"}
            <Text style={{ fontWeight: 'bold', color: '#3b82f6' }}>{email || 'อีเมลของคุณ'}</Text>
          </Text>

          <TextField
            label="รหัส OTP (6 หลัก)"
            placeholder="123456"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          
          <TextField
            label="รหัสผ่านใหม่"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonWrapper}>
            <PrimaryButton 
              title={submitting ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'Reset Password'} 
              onPress={handleSubmit} 
              loading={submitting} 
            />
          </View>

          <View style={styles.footer}>
            <Link href="/(auth)/login" style={styles.link}>⬅ กลับไปหน้า Login</Link>
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
    marginTop: 40,
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
    lineHeight: 20,
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