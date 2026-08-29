// app/(app)/(tabs)/manage-tag.tsx
// TODO: ดู src/app/user/manage-tag/page.tsx ฝั่งเว็บสำหรับ behavior เต็ม
// Endpoints ที่ต้องใช้:
//   GET  /api/tags                         — รายการแท็กทั้งหมด (สำหรับ dropdown เลือกแท็กเป้าหมาย)
//   PUT  /api/tags/[id]                    — แก้ชื่อ/สีแท็ก
//   DELETE /api/tags/[id]                  — ลบแท็ก
//   GET  /api/files?sort=...&tagId=...     — เรียกดูไฟล์เพื่อเลือกมาติดแท็ก (รองรับ ?untagged=true ด้วย)
//   POST /api/tags/[id]/files { fileIds }  — เพิ่มไฟล์ที่เลือกเข้าแท็ก (แบบเติม ไม่ลบแท็กเดิม)
// สำคัญ: ไฟล์ที่ hasPassword=true และเป็นรูป ห้ามโหลด/โชว์ thumbnail จริง ให้โชว์ 🔒 แทน
import { View, Text, StyleSheet } from 'react-native';

export default function ManageTagScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Manage Tag screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
