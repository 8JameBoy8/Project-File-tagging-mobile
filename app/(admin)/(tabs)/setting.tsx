// app/(admin)/(tabs)/setting.tsx
// TODO: ดู src/app/admin/setting/page.tsx ฝั่งเว็บสำหรับ behavior เต็ม
//
// Endpoints:
//   GET /api/admin/stats          -> { totalUsers: number }
//   PATCH /api/profile            -> { language: 'TH' | 'EN' }  (เปลี่ยนภาษา — admin ก็เป็น User
//                                     ธรรมดาคนหนึ่งในระบบ ใช้ endpoint เดียวกับฝั่ง user เป๊ะๆ)
//   POST /api/auth/logout         -> เรียกแล้ว logout() จาก useAuth() ต่อเลย (เหมือน setting.tsx
//                                     ฝั่ง (app) ปกติ ดูตัวอย่างได้จากไฟล์นั้น)
//
// ข้อมูลโปรไฟล์ตัวเอง (username/email ของ admin) ใช้ useAuth().user ตรงๆ ได้เลย ไม่ต้อง fetch
// เพิ่ม เพราะ AuthContext ดึงจาก GET /api/profile มาให้อยู่แล้วตอน login
import { View, Text, StyleSheet } from 'react-native';

export default function AdminSettingScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Admin Setting screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
