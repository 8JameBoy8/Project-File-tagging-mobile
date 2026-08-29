// app/(app)/profile.tsx
// TODO: ดู src/app/user/profile/page.jsx ฝั่งเว็บสำหรับ behavior เต็ม
// Endpoints: GET/PATCH /api/profile { displayName, language }, POST /api/profile/avatar
// (multipart, field "avatar", ต้องมี CLOUDINARY_URL ฝั่ง server ไม่งั้น 500),
// GET /api/profile/storage { usedBytes, limitBytes }, POST /api/profile/change-password
// { oldPassword, newPassword } (ไม่ใช้ OTP)
// แนะนำใช้ expo-image-picker สำหรับเลือกรูปโปรไฟล์
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text>TODO: Profile screen — ดู comment ด้านบนของไฟล์นี้สำหรับ endpoint ที่ต้องใช้</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
