// components/AuthedThumbnail.tsx — thumbnail รูปภาพที่ต้อง auth ถึงจะโหลดได้ (endpoint
// /api/files/[id]/serve เช็ค Authorization header ทุกครั้ง ไม่ใช่ URL สาธารณะ)
//
// ลองมาแล้ว 2 วิธีก่อนจะได้ตัวที่ใช้งานได้จริง (ทั้งคู่เจอตอนทดสอบบนมือถือจริงเท่านั้น ไม่มีทาง
// เจอจาก tsc/web preview):
//   1) <Image source={{ uri, headers: { Authorization } }}> ตรงๆ — ไม่ทำงาน เพราะ Image component
//      ของ RN บน Android ไม่ส่ง header พวกนี้ไปกับ request จริงเสมอไป (native image pipeline แยก
//      จาก fetch ปกติ) และไม่มี error ให้เห็นด้วย โหลดไม่ขึ้นเงียบๆ
//   2) fetch เป็น Blob จริงแล้วแปลงเป็น URI ด้วย URL.createObjectURL (เอกสาร/ตัวอย่างของ RN เองก็
//      แนะนำวิธีนี้) — พัง throw "Cannot create URL for blob!" เพราะ native Blob module ของ Expo Go
//      เวอร์ชันนี้ไม่ได้ผูก BLOB_URI_SCHEME ไว้ (ดูเหมือนกำลังจะเลิกใช้กลไกนี้ไปเป็น expo-blob แทน)
// ทางที่ใช้งานได้จริง: อ่าน Blob เป็น base64 data URI ผ่าน FileReader.readAsDataURL (native module
// คนละตัวกับที่พังด้านบน อาศัยแค่การอ่านไบต์ ไม่ต้องพึ่ง content provider/blob store ของระบบเลย)
// แล้วให้ <Image> โหลดจาก data: URI ตรงๆ — ข้อเสียคือกิน memory มากกว่า (base64 ใหญ่กว่าไฟล์จริง
// ~33%) แต่ thumbnail/preview ไฟล์ในแอปนี้ไม่ใหญ่มาก (จำกัดที่ 50MB ต่อไฟล์อยู่แล้ว) ยอมรับได้
import React, { useEffect, useState } from 'react';
import { Image, Text, StyleSheet, type ImageStyle, type ImageResizeMode, type StyleProp } from 'react-native';
import { apiFetchBlob } from '@/lib/api';
import type { FileItem } from '@/types';

function fallbackIcon(type: FileItem['type']) {
  if (type === 'document') return '📄';
  if (type === 'image') return '🖼️';
  if (type === 'video') return '🎬';
  if (type === 'audio') return '🎵';
  return '📁';
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('อ่านไฟล์รูปไม่สำเร็จ'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function AuthedThumbnail({
  file,
  style,
  resizeMode = 'cover',
}: {
  file: FileItem;
  style?: StyleProp<ImageStyle>;
  // 'cover' (ค่าเริ่มต้น) เหมาะกับ thumbnail เล็กๆ (list/grid) — ครอปให้เต็มกรอบสี่เหลี่ยม
  // 'contain' เหมาะกับ preview ใหญ่ — โชว์ภาพเต็มไม่ครอปขอบทิ้ง (ปล่อยพื้นที่ว่างซ้ายขวา/บนล่างแทน)
  resizeMode?: ImageResizeMode;
}) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetchBlob(file.src)
      .then((blob) => blobToDataUri(blob))
      .then((dataUri) => {
        if (!cancelled) setUri(dataUri);
      })
      .catch((err) => {
        // โหลด thumbnail ไม่สำเร็จ — ปล่อยให้ fallback เป็นไอคอนไป ไม่ block การใช้งานหน้าอื่น
        console.error('AuthedThumbnail load error:', file.src, err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.src]);

  if (!uri) return <Text style={styles.fallbackIcon}>{fallbackIcon(file.type)}</Text>;
  return <Image source={{ uri }} style={style} resizeMode={resizeMode} />;
}

const styles = StyleSheet.create({
  fallbackIcon: { fontSize: 34 },
});
