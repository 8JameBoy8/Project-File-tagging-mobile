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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';


export default function UploadScreen() {
  // เก็บไฟล์ที่ผู้ใช้เลือก
  const [file, setFile] = useState<any>(null);

  // เก็บ ID ของ Tag ที่ผู้ใช้เลือก
  const [selectedTagId, setSelectedTagId] =
    useState<string | null>(null);

  // เก็บ Password ที่ผู้ใช้กรอก
  const [password, setPassword] = useState('');

  // ข้อมูล Tag สำหรับแสดงบนหน้า
  const tags = [
    { id: '1', name: 'Document' },
    { id: '2', name: 'Work' },
    { id: '3', name: 'Personal' },
  ];

  // เปิดตัวเลือกไฟล์จากเครื่อง
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '/',
        copyToCacheDirectory: true,
      });

      // เก็บไฟล์ที่เลือกไว้ใน state
      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Pick file error:', error);

      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถเลือกไฟล์ได้'
      );
    }
  };

  // ลบไฟล์ที่เลือกออกจากหน้า
  const removeFile = () => {
    setFile(null);
  };

  // ส่งไฟล์ Tag และ Password ไปยัง POST /api/files
  const handleConfirm = async () => {
    if (!file) {
      Alert.alert(
        'แจ้งเตือน',
        'กรุณาเลือกไฟล์ก่อน'
      );
      return;
    }

    try {
      // สร้าง FormData สำหรับส่งข้อมูลแบบ multipart/form-data
      const form = new FormData();

      // เพิ่มไฟล์สำหรับ React Native
      form.append('file', {
        uri: file.uri,
        name: file.fileName || file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      // ส่ง Tag เป็น JSON string array
      form.append(
        'tags',
        JSON.stringify(
          selectedTagId ? [selectedTagId] : []
        )
      );

      // ส่ง Password เฉพาะเมื่อผู้ใช้กรอก
      if (password) {
        form.append('password', password);
      }

      // เรียก API เพื่ออัปโหลดไฟล์
      const response = await apiFetch('/api/files', {
        method: 'POST',
        body: form,
      });

      // 202 หมายถึงไฟล์เข้าสู่คิวตรวจสอบแล้ว
      if (response.status === 202) {
        Alert.alert(
          'Upload สำเร็จ',
          'กำลังตรวจสอบไฟล์...'
        );
        return;
      }

      Alert.alert(
        'Upload ไม่สำเร็จ',
        'ไม่สามารถอัปโหลดไฟล์ได้'
      );
    } catch (error) {
      console.error('Upload error:', error);

      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
      );
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Import File
      </Text>

      {/* กดเพื่อเปิดตัวเลือกไฟล์ */}
      <TouchableOpacity
        style={styles.importBox}
        onPress={pickFile}
        activeOpacity={0.7}
      >
        <View style={styles.uploadIcon}>
          <Text style={styles.uploadIconText}>
            ↑
          </Text>
        </View>

        <Text style={styles.importTitle}>
          Import File
        </Text>

        <Text style={styles.importDescription}>
          Tap to select a file from your device
        </Text>
      </TouchableOpacity>

      {/* แสดงไฟล์ที่ผู้ใช้เลือก */}
      {file && (
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>
            Selected File
          </Text>

          <View style={styles.fileCard}>
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>
                FILE
              </Text>
            </View>

            <View style={styles.fileInfo}>
              <Text
                style={styles.fileName}
                numberOfLines={1}
              >
                {file.name}
              </Text>

              <Text style={styles.fileType}>
                {file.mimeType || 'Unknown type'}
              </Text>
            </View>

            {/* ปุ่มลบไฟล์ */}
            <TouchableOpacity
              onPress={removeFile}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteText}>
                ×
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* เลือก Tag */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tag
        </Text>

        <View style={styles.tagContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tag,
                selectedTagId === tag.id &&
                  styles.selectedTag,
              ]}
              onPress={() =>
                setSelectedTagId(
                  selectedTagId === tag.id
                    ? null
                    : tag.id
                )
              }
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTagId === tag.id &&
                    styles.selectedTagText,
                ]}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* กรอก Password แบบ Optional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter password (optional)"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* กดเพื่อยืนยันและอัปโหลด */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm}
        activeOpacity={0.7}
      >
        <Text style={styles.confirmText}>
          Confirm
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 24,
  },

  // กล่องสำหรับเลือกไฟล์
  importBox: {
    height: 180,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 12,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  uploadIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  uploadIconText: {
    fontSize: 30,
    color: '#333',
  },

  importTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#222',
  },

  importDescription: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
  },

  fileSection: {
    marginBottom: 22,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },

  fileCard: {
    minHeight: 70,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  fileIcon: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  fileIconText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555',
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },

  fileType: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },

  deleteText: {
    fontSize: 28,
    color: '#555',
    paddingHorizontal: 8,
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 20,
    backgroundColor: '#FFF',
  },

  selectedTag: {
    backgroundColor: '#D9D9D9',
    borderColor: '#333',
  },

  tagText: {
    fontSize: 14,
    color: '#333',
  },

  selectedTagText: {
    fontWeight: '600',
    color: '#222',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#FFF',
  },

  confirmButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: 5,
  },

  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
});