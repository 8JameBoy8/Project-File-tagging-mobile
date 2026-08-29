// app/(auth)/forgot-password.tsx
// TODO: ยังไม่ได้ออกแบบ UI จริง — ทำตาม flow นี้ (ดูตัวอย่างเต็มที่ src/app/auth/forgot-password/page.tsx
// ในโปรเจกต์เว็บ):
//   1. กรอกอีเมล -> POST /api/auth/forget-password { email } -> ถ้าสำเร็จไปขั้นตอน 2
//   2. กรอก OTP 6 หลักที่ได้ทางอีเมล -> ไม่มี endpoint verify OTP แยก ให้เก็บ email+otp ไว้
//      (เช่น router.push ไปหน้า change-password พร้อม params) แล้วไปกรอกรหัสผ่านใหม่ต่อ
//   3. หน้า change-password เรียก POST /api/auth/reset-password { email, otp, newPassword }
//      เช็ค OTP พร้อมตั้งรหัสใหม่ในทีเดียว
import { View, Text, StyleSheet } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Forgot Password screen — ดู comment ด้านบนของไฟล์นี้สำหรับ flow ที่ต้องทำ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
