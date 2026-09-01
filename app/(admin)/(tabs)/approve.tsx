// app/(admin)/(tabs)/approve.tsx
// TODO: ดู src/app/admin/approve/page.tsx ฝั่งเว็บสำหรับ behavior เต็ม (โครง UI: ซ้าย = รายละเอียด
// ไฟล์ที่เลือก + เหตุผลที่ถูกตีธง + ปุ่ม Approve/Reject, ขวา = list ไฟล์ที่รอตรวจทั้งหมด)
//
// นี่คือคิวไฟล์ที่ Cloudmersive สแกนแล้ว "ไม่ชัวร์ว่าปลอดภัย" เท่านั้น — ไฟล์ที่สแกนผ่านปกติจะ
// เข้าระบบเป็น File จริงเองอัตโนมัติไปแล้ว ไม่ต้องผ่านหน้านี้เลย (ดู docs/API.md ฝั่งเว็บสำหรับ
// รายละเอียด pipeline เต็ม)
//
// Endpoints:
//   GET /api/admin/moderation                     (default status=PENDING_REVIEW อยู่แล้ว)
//     -> { items: ModerationItem[] }  (แต่ละ item มี item.uploader มาให้แล้ว, ดู types/index.ts)
//   GET /api/admin/moderation/[id]                 (ดูรายละเอียดไฟล์เดียวแบบเต็ม ถ้าต้องการ)
//     -> { item: ModerationItem & { uploader } }
//   POST /api/admin/moderation/[id]/approve
//     -> { file: FileItem }  — สร้างไฟล์จริงในระบบทันที (โผล่ให้ user เห็นใน Home ปกติ)
//   POST /api/admin/moderation/[id]/reject
//     -> { item: ModerationItem }  — ลบไฟล์ออกจาก Cloudinary จริงด้วย ไม่ต้องทำอะไรเพิ่ม
//
// หมายเหตุ: item.tagIds เป็น JSON string ของ tag id ที่ user เลือกไว้ตอนอัปโหลด (ไม่ใช่ชื่อ tag)
// เว็บแสดงแค่ "จำนวน tag" ไม่ได้ resolve เป็นชื่อ เพราะ admin ไม่มีสิทธิ์ดู tag ของ user คนอื่น
// โดยตรง (ไม่มี endpoint ให้) — ทำแบบเดียวกันฝั่ง mobile ก็พอ
// item.scanResult เป็น JSON string ดิบจาก Cloudmersive — โชว์เป็นข้อความเหตุผลตรงๆ ได้เลย
import { View, Text, StyleSheet } from 'react-native';

export default function AdminApproveScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Admin Approve / Select screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
