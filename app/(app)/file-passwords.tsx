// app/(app)/file-passwords.tsx
// TODO: ดู src/app/user/filepassword/page.jsx ฝั่งเว็บสำหรับ behavior เต็ม
// Flow: ก่อนเข้าหน้านี้ ต้องกรอกรหัสผ่านบัญชี -> POST /api/profile/verify-password { password }
// จากนั้นค่อยโหลดรายการ: GET /api/files?hasPassword=true
// "ดูรหัส": GET /api/files/[id]/password (เรียกเฉพาะตอนกดดูเท่านั้น ไม่ fetch รวมทีเดียวหมด)
// "เปลี่ยนรหัส": PUT /api/files/[id]/password { password }
// คอลัมน์ tag ต้องโชว์ทั้งชื่อและสี — เอาสีจาก GET /api/tags มาจับคู่กับชื่อ tag ของแต่ละไฟล์เอง
import { View, Text, StyleSheet } from 'react-native';

export default function FilePasswordsScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: File Passwords screen — ดู comment ด้านบนของไฟล์นี้สำหรับ flow ที่ต้องทำ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
