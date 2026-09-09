// components/AuthedVideoPlayer.tsx — เล่นวิดีโอในแอปโดยตรง สตรีมจาก endpoint ที่ต้อง auth
// (ต่างจากรูปที่ทำใน AuthedThumbnail: expo-video เล่นจาก URL สตรีมได้ตรงๆ พร้อมแนบ header เองผ่าน
// VideoSource.headers ไม่ต้องโหลดทั้งไฟล์มาพักไว้ในเครื่องก่อน — วิดีโอมักไฟล์ใหญ่กว่ารูปมาก
// โหลดทั้งไฟล์มาเก็บเป็น base64 แบบ AuthedThumbnail จะช้า/กิน memory เกินไป)
import React, { useEffect, useState } from 'react';
import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { getToken } from '@/lib/storage';
import { resolveApiUrl } from '@/lib/api';

export function AuthedVideoPlayer({ src, style }: { src: string; style?: StyleProp<ViewStyle> }) {
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    getToken().then((token) => {
      setHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    });
  }, []);

  // source เป็น null จนกว่าจะได้ token ก่อน — useVideoPlayer สร้าง player ใหม่ทุกครั้งที่ source
  // เปลี่ยน (รวมถึงตอนเปลี่ยนจาก null เป็นค่าจริง) เลยไม่ต้องกังวลว่าจะเล่นไม่ได้ตอน token มาช้า
  const player = useVideoPlayer(headers ? { uri: resolveApiUrl(src), headers } : null);

  if (!headers) return null;

  return (
    <VideoView
      player={player}
      style={[styles.video, style]}
      nativeControls
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  video: { width: '100%', height: '100%' },
});
