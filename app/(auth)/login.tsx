// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useAuth, ApiError } from '@/context/AuthContext';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';

export default function LoginScreen() {
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
      // ไม่ต้อง router.replace เอง — app/(auth)/_layout.tsx เช็ค user แล้ว redirect ให้อัตโนมัติ
      // ทันทีที่ login สำเร็จ (เห็น user ไม่ null ก็เด้งออกจากโซน auth เอง)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'เข้าสู่ระบบไม่สำเร็จ');
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
        
        {/* ไอคอนกลมๆ ด้านบน */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>

        <Text style={styles.title}>LOGIN</Text>

        {/* ใช้ TextField ของเพื่อน */}
        <TextField
          label="Gmail"
          placeholder="Example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        {/* ใช้ TextField ของเพื่อน */}
        {/* autoCapitalize="none" — ไม่งั้นตัวอักษรแรกที่พิมพ์ (ไม่ใช่ paste) จะถูก keyboard เปลี่ยน
            เป็นตัวใหญ่ให้อัตโนมัติ ทำให้รหัสผ่านที่ตั้งใจให้ตัวเล็กขึ้นต้นกลายเป็นผิดแบบเงียบๆ */}
        <TextField
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {/* แสดง Error สีแดงถ้าล็อกอินพลาด */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* ใช้ ปุ่มของเพื่อน */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton 
            title={submitting ? 'กำลังเข้าสู่ระบบ...' : 'Login'} 
            onPress={handleSubmit} 
            loading={submitting} 
          />
        </View>

        <View style={styles.footer}>
          <Link href="/(auth)/register" style={styles.link}>Register?</Link>
          <Link href="/(auth)/forgot-password" style={styles.link}>ลืมรหัสผ่าน</Link>
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
    paddingTop: 50, // เผื่อที่ให้ไอคอนกลมๆ
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
    justifyContent: 'space-between', 
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