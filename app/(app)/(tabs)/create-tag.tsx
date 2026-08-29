// app/(app)/(tabs)/create-tag.tsx
// TODO: ดู src/app/user/create-tag/page.tsx ฝั่งเว็บสำหรับ behavior เต็ม
// Endpoints: GET /api/tags, POST /api/tags { name, color }, DELETE /api/tags/[id]
// หมายเหตุ: Tag เป็นของแต่ละ user แล้ว (ไม่ใช่ global) — GET /api/tags คืนแค่ tag ของตัวเอง (ดู docs/API.md)
import { View, Text, StyleSheet } from 'react-native';

export default function CreateTagScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Create Tag screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
