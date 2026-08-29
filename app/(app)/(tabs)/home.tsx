// app/(app)/(tabs)/home.tsx
// ตัวอย่างหน้าจอที่ดึงข้อมูลจริงจาก API แล้ว render เป็น list — ใช้ pattern นี้เป็นแบบ
// (fetch แบบมี auth header อัตโนมัติผ่าน apiFetch, จัดการ loading/error, FlatList)
// ยังไม่ได้ทำ: preview รูป/วิดีโอ, sort/filter, ปุ่ม download/delete, ด่านรหัสผ่านไฟล์
// (ดู src/app/user/home/page.tsx ฝั่งเว็บ สำหรับ behavior เต็มที่ต้องทำ)
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { apiFetch } from '@/lib/api';
import type { FileItem } from '@/types';

export default function HomeScreen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setError('');
    try {
      const data = await apiFetch<FileItem[]>('/api/files?sort=date-desc');
      setFiles(data);
    } catch {
      setError('โหลดไฟล์ไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadFiles();
      setLoading(false);
    })();
  }, [loadFiles]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={files.length === 0 && styles.center}
      ListEmptyComponent={<Text>{error || 'ไม่พบไฟล์'}</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.icon}>{item.hasPassword ? '🔒' : '📄'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.tags}>{item.tags.join(', ') || '—'}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  icon: { fontSize: 24 },
  name: { fontWeight: '600', fontSize: 14 },
  tags: { color: '#6b7280', fontSize: 12, marginTop: 2 },
});
