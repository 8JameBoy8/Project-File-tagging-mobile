// components/TabIcon.tsx — ไอคอนแท็บด้านล่างแบบ emoji ใช้ร่วมกันทั้ง (app)/(tabs) และ
// (admin)/(tabs) — เดิม (admin) ใช้ dingbat unicode ธรรมดา (⌂ ✓ ⚙) ส่วน (app) ไม่มีไอคอนเลย
// (ทั้งสองแบบพัง: dingbat หลายตัวไม่มี glyph ในฟอนต์ default ของ Android บางรุ่น ขึ้นเป็นกล่อง
// "missing glyph" แทน — เจอจริงตอนทดสอบบนมือถือจริงผ่าน Expo Go, ตอนทดสอบผ่าน tsc/web preview
// ก่อนหน้านี้ไม่เจอเพราะเป็นปัญหาเฉพาะ native renderer) emoji ใช้ font สีของระบบที่ติดตั้งมาด้วย
// เสมอทั้ง iOS/Android เลยไม่มีปัญหา glyph หายแบบนี้
//
// emoji เป็นสีในตัวอยู่แล้ว เปลี่ยน color ผ่าน style ไม่ได้ (RN/OS ไม่รองรับ) เลยใช้ opacity
// แทนสีเพื่อบอกว่าอันไหน focused อยู่ (ตรงกับ tabBarActiveTintColor/tabBarInactiveTintColor ที่
// คุม "label" text แยกกันอยู่แล้วใน screenOptions ของแต่ละ layout)
import { Text, StyleSheet } from 'react-native';

export function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={[styles.icon, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 20 },
});
