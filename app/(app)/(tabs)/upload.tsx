// app/(app)/(tabs)/upload.tsx
// TODO: ดู src/app/user/uploadfile/page.jsx ฝั่งเว็บสำหรับ behavior เต็ม
// แนะนำใช้ expo-image-picker หรือ expo-document-picker เพื่อเลือกไฟล์จากเครื่อง
// อัปโหลดด้วย multipart/form-data ไปที่ POST /api/files — field: file (จำเป็น),
// tags (JSON string array ของ tag id, optional — ติด tag เดียวกันให้ทุกไฟล์ที่อัปพร้อมกัน),
// password (optional string — ถ้าใส่ ไฟล์นั้นต้องกรอกรหัสถึงเปิดดูได้)
//
// สำคัญ (เปลี่ยนพฤติกรรมแล้ว — ดู docs/API.md): response เป็น 202 { status: 'PENDING_SCAN',
// moderationItemId } ไม่ใช่ file object อีกต่อไป เพราะไฟล์ต้องผ่านคิวสแกนไวรัสก่อนเสมอ (ไม่กี่
// วินาที) — แสดงข้อความ "กำลังตรวจสอบไฟล์..." แล้วปล่อยให้ไฟล์โผล่เองใน GET /api/files ตอนผู้ใช้
// กลับไปหน้า Home ไม่ต้อง poll สถานะทีละไฟล์
//
// ตัวอย่างส่ง (React Native FormData รับ object ที่มี uri/name/type แทน File ของเว็บ):
//   const form = new FormData();
//   form.append('file', { uri: asset.uri, name: asset.fileName, type: asset.mimeType } as any);
//   form.append('tags', JSON.stringify(selectedTagId ? [selectedTagId] : []));
//   if (password) form.append('password', password);
//   await apiFetch('/api/files', { method: 'POST', body: form }); // -> 202 { status, moderationItemId }
import { View, Text, StyleSheet } from 'react-native';

export default function UploadScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Upload screen — ดู comment ด้านบนของไฟล์นี้สำหรับวิธีอัปโหลด</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
