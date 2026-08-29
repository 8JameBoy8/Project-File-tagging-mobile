// app/(auth)/change-password.tsx
// TODO: หน้ารับ email+otp มาจากหน้า forgot-password แล้วให้กรอกรหัสผ่านใหม่ 2 ช่อง
// -> POST /api/auth/reset-password { email, otp, newPassword } -> สำเร็จแล้วพาไป /(auth)/login
import { View, Text, StyleSheet } from 'react-native';

export default function ChangePasswordScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Change Password screen (มาจาก flow ลืมรหัสผ่าน) — ดู comment ด้านบนของไฟล์นี้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
