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

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch, ApiError } from '@/lib/api';
import type { Tag } from '@/types';
import TextField from '@/components/TextField';
import PrimaryButton from '@/components/PrimaryButton';
import { useLanguage } from '@/context/LanguageContext';

// จำกัดจำนวน/ขนาดไฟล์ตรงกับฝั่งเว็บ (ดู src/app/user/uploadfile/page.jsx)
const MAX_FILES = 8;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ห่อ asset จาก DocumentPicker ด้วย id ของตัวเอง — DocumentPickerAsset ไม่มี id ในตัว และถ้าเลือก
// ไฟล์เดียวกันซ้ำสองครั้ง uri จะซ้ำกันด้วย ใช้ id นี้เป็น key/อ้างอิงตอนลบทีละไฟล์แทน
type PickedFile = { id: string; asset: DocumentPicker.DocumentPickerAsset };

export default function UploadScreen() {
  const { t } = useLanguage();
  // เก็บไฟล์ที่ผู้ใช้เลือกไว้ทั้งหมด (เลือกได้หลายไฟล์ เพิ่มทีละรอบได้ ไม่ทับของเดิม — เดิมเป็น
  // single-file แล้วเลือกไฟล์ใหม่ทีไรทับของเก่าทันที เป็นบั๊กที่เจอตอนทดสอบจริงบนมือถือ)
  const [files, setFiles] = useState<PickedFile[]>([]);

  // เก็บ ID ของ Tag ที่ผู้ใช้เลือก
  const [selectedTagId, setSelectedTagId] =
    useState<string | null>(null);

  // เก็บ Password ที่ผู้ใช้กรอก (ถ้าใส่ จะใช้รหัสเดียวกันกับทุกไฟล์ในชุดนี้ — ฝั่งเว็บเลือกได้ละเอียด
  // กว่าว่าจะใช้กับไฟล์ไหนบ้าง แต่มือถือทำแบบง่ายกว่าคือใช้ร่วมกันทั้งชุด)
  const [password, setPassword] = useState('');

  // สถานะกำลังอัปโหลด (กันกดซ้ำ + โชว์ loading บนปุ่ม)
  const [uploading, setUploading] = useState(false);

  // Tag จริงของ user คนนี้ ดึงจาก GET /api/tags (คืนเป็น array ตรงๆ ไม่มี wrapper object)
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    apiFetch<Tag[]>('/api/tags')
      .then(setTags)
      .catch(() => {
        // โหลด tag ไม่สำเร็จ — ปล่อยให้ list ว่างไปก่อน ไม่ block การอัปโหลดไฟล์แบบไม่ติด tag
      });
  }, []);

  // เปิดตัวเลือกไฟล์จากเครื่อง — เลือกได้หลายไฟล์ต่อครั้ง (multiple: true) และกดเลือกซ้ำได้เรื่อยๆ
  // เพื่อเพิ่มไฟล์เข้าไปในชุดเดิม (ไม่ทับของที่เลือกไว้ก่อนหน้า)
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const room = MAX_FILES - files.length;
      if (room <= 0) {
        Alert.alert(t('notice_title'), t('upload_max_files', { count: MAX_FILES }));
        return;
      }

      const tooBig: string[] = [];
      const accepted: PickedFile[] = [];
      for (const asset of result.assets) {
        if ((asset.size ?? 0) > MAX_FILE_SIZE) {
          tooBig.push(asset.name);
          continue;
        }
        accepted.push({ id: `${asset.uri}-${Date.now()}-${Math.random()}`, asset });
      }

      const overflow = accepted.length > room;
      const toAdd = accepted.slice(0, room);

      if (toAdd.length > 0) {
        setFiles((prev) => [...prev, ...toAdd]);
      }
      if (tooBig.length > 0) {
        Alert.alert(t('upload_file_too_big_title'), t('upload_file_too_big_msg', { names: tooBig.join(', ') }));
      } else if (overflow) {
        Alert.alert(t('notice_title'), t('upload_max_files_partial', { count: MAX_FILES }));
      }
    } catch (error) {
      console.error('Pick file error:', error);

      Alert.alert(
        t('upload_pick_error_title'),
        t('upload_pick_error_msg')
      );
    }
  };

  // ลบไฟล์ที่เลือกออกจากหน้า (ลบทีละไฟล์ตาม id)
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // ส่งไฟล์ทั้งชุด + Tag + Password ไปยัง POST /api/files ทีละไฟล์ (endpoint รับไฟล์เดียวต่อ
  // request — เหมือนฝั่งเว็บ ดู src/app/user/uploadfile/page.jsx)
  const handleConfirm = async () => {
    if (files.length === 0) {
      Alert.alert(
        t('notice_title'),
        t('upload_select_file_first')
      );
      return;
    }

    setUploading(true);
    let successCount = 0;
    for (const { asset } of files) {
      const form = new FormData();

      // เจอจริงตอนทดสอบบนมือถือ: SDK นี้เปลี่ยน fetch/FormData ทั้งระบบเป็นของ Expo เอง
      // ("winter" runtime) ซึ่ง type ประกาศว่ารองรับ RN แบบเดิม { uri, name, type } (โยน path ให้
      // native อ่านไฟล์เอง ไม่ต้องโหลดเข้า JS memory) แต่ตัวแปลง FormData ตอนส่งจริง
      // (node_modules/expo/src/winter/fetch/convertFormData.ts) ดันไม่ได้ implement เคส uri ไว้จริง
      // (คอมเมนต์ในซอร์สเขียนไว้ตรงๆ ว่า "`uri` is not supported") พอส่ง { uri, name, type } ไปเลย
      // ตกไปเคส else แล้ว throw "Unsupported FormDataPart implementation" ทุกครั้ง — ทางแก้คือ fetch
      // ไฟล์ในเครื่อง (local file://) ให้ได้เป็น Blob จริงก่อน แล้ว append Blob แทน (เคสนี้ implement
      // จริง รองรับแน่นอน) ข้อเสียคือไฟล์ต้องโหลดเข้า memory ทั้งไฟล์ก่อนส่ง แต่ไฟล์จำกัดที่ 50MB
      // อยู่แล้วเลยไม่มีปัญหา
      const localBlob = await (await fetch(asset.uri)).blob();
      // เซ็ต MIME type ให้ตรงเสมอ (blob จาก local fetch อาจไม่ได้ type มาถูกต้อง) — slice() แบบไม่ตัด
      // เนื้อหาเลย (0 ถึง size เต็ม) คือวิธีมาตรฐานของ Blob API ที่ใช้ "เปลี่ยน type" โดยไม่ต้อง copy ข้อมูลใหม่
      const typedBlob = localBlob.slice(0, localBlob.size, asset.mimeType || 'application/octet-stream');
      form.append('file', typedBlob, asset.name);

      form.append('tags', JSON.stringify(selectedTagId ? [selectedTagId] : []));
      if (password) form.append('password', password);

      try {
        // apiFetch คืนค่า JSON ที่ parse แล้วตรงๆ (ไม่มี .status) และจะ throw ApiError เองถ้า
        // response ไม่ ok เลยแค่ไม่ throw ก็แปลว่าสำเร็จ (202 PENDING_SCAN)
        await apiFetch('/api/files', { method: 'POST', body: form });
        successCount += 1;
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    setUploading(false);

    if (successCount === files.length) {
      Alert.alert(
        t('upload_success_title'),
        t('upload_success_msg', { count: successCount })
      );
      setFiles([]);
      setSelectedTagId(null);
      setPassword('');
    } else {
      Alert.alert(
        t('upload_partial_title'),
        t('upload_partial_msg', { success: successCount, total: files.length })
      );
      // เอาเฉพาะไฟล์ที่ยังไม่สำเร็จออกจากลิสต์ไม่ได้ตรงๆ (ไม่รู้ว่าอันไหนพังจากลูปข้างบน) เลยปล่อย
      // ทั้งชุดไว้ให้ผู้ใช้ตรวจสอบ/กดอัปโหลดซ้ำเอง ปลอดภัยกว่าการเดาว่าไฟล์ไหนสำเร็จแล้วเงียบๆ ลบทิ้ง
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        {t('tab_import_file')}
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
          {t('tab_import_file')}
        </Text>

        <Text style={styles.importDescription}>
          {t('upload_description')}
        </Text>
      </TouchableOpacity>

      {/* แสดงไฟล์ที่ผู้ใช้เลือกไว้ทั้งหมด — เลือกเพิ่มได้เรื่อยๆ โดยกดกล่องด้านบนซ้ำ */}
      {files.length > 0 && (
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>
            {t('upload_selected_files', { count: files.length, max: MAX_FILES })}
          </Text>

          {files.map(({ id, asset }) => (
            <View style={styles.fileCard} key={id}>
              <View style={styles.fileIcon}>
                <Text style={styles.fileIconText}>
                  {t('upload_file_icon_label')}
                </Text>
              </View>

              <View style={styles.fileInfo}>
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                >
                  {asset.name}
                </Text>

                <Text style={styles.fileType}>
                  {asset.mimeType || t('upload_unknown_type')}
                </Text>
              </View>

              {/* ปุ่มลบไฟล์ (ลบเฉพาะไฟล์นี้ ไม่กระทบไฟล์อื่นที่เลือกไว้) */}
              <TouchableOpacity
                onPress={() => removeFile(id)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* เลือก Tag */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('tag_label')}
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
        <TextField
          label={t('password_label')}
          placeholder={t('upload_password_placeholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* กดเพื่อยืนยันและอัปโหลด */}
      <PrimaryButton
        title={uploading ? t('upload_uploading') : t('upload_confirm_btn')}
        onPress={handleConfirm}
        loading={uploading}
      />
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