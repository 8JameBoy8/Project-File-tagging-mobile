// app/(admin)/(tabs)/home.tsx
// TODO: ดู src/app/admin/home/page.tsx ฝั่งเว็บสำหรับ behavior เต็ม (โครง UI: ซ้าย = รายละเอียด
// user ที่เลือก + ปุ่มลบ, ขวา = list ไฟล์ทุกคนรวมกัน กดไฟล์ไหนเปลี่ยนไปดู user ที่อัปโหลดไฟล์นั้น)
//
// Endpoints:
//   GET /api/admin/user?limit=100
//     -> { users: AdminUser[], pagination: {...} }  (ดู types/index.ts: AdminUser)
//   DELETE /api/admin/user/[id]
//     -> soft delete, กันลบตัวเองอยู่แล้วฝั่ง API (400 CANNOT_DELETE_SELF)
//   GET /api/admin/moderation?status=all
//     -> { items: ModerationItem[] }  (ทุกสถานะ ไม่ใช่แค่ PENDING_REVIEW — ใช้แสดงไฟล์ทุกคนใน list
//        ฝั่งขวา, แต่ละ item มี item.uploader.{id,displayName,email} มาให้แล้วไม่ต้อง join เอง)
//
// Flow แนะนำ (เหมือนเว็บ): fetch ทั้งสอง endpoint พร้อมกันตอน mount, เลือก user แรกใน list เป็น
// default, คำนวณ selectedUser จาก users.find(u => u.id === selectedUserId), กดไฟล์ใน list ฝั่งขวา
// ให้ setSelectedUserId(file.uploadedBy) แทน (ไม่ต้อง fetch ซ้ำ)
//
// หมายเหตุ: ปุ่ม "Rename" ที่เว็บไม่มีในหน้านี้แล้ว — ไม่มี endpoint รองรับการแก้ displayName ของ
// user คนอื่นจากฝั่ง admin เลย อย่าใส่ปุ่มนี้เพิ่มเองจนกว่าจะมี endpoint จริง
import { View, Text, StyleSheet } from 'react-native';

export default function AdminHomeScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Admin Home screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
