// components/AuthedAudioPlayer.tsx — เล่นเสียงในแอปโดยตรง สตรีมจาก endpoint ที่ต้อง auth
// เหมือน AuthedVideoPlayer แต่ expo-audio ไม่มี UI ควบคุมสำเร็จรูปให้เหมือน VideoView
// (nativeControls) เลยต้องสร้างปุ่ม play/pause + เวลาเอง แบบง่ายๆ พอ
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { getToken } from '@/lib/storage';
import { resolveApiUrl } from '@/lib/api';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AuthedAudioPlayer({ src }: { src: string }) {
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    getToken().then((token) => {
      setHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    });
  }, []);

  const player = useAudioPlayer(headers ? { uri: resolveApiUrl(src), headers } : null);
  const status = useAudioPlayerStatus(player);

  if (!headers) return null;

  // เล่นจบแล้ว currentTime ค้างอยู่ที่ท้ายคลิป ไม่ reset กลับไปต้นคลิปเองอัตโนมัติ — กด play() ซ้ำ
  // เฉยๆ เลยไม่มีผล (ไม่มีอะไรให้เล่นต่อจากท้ายคลิปแล้ว) ต้อง seekTo(0) ก่อนเสมอถ้าเพิ่งเล่นจบไป
  const handlePressPlay = async () => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.05)) {
      await player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={handlePressPlay}
        activeOpacity={0.8}
      >
        <Text style={styles.playBtnText}>{status.playing ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <Text style={styles.time}>
        {formatTime(status.currentTime)} / {formatTime(status.duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 14 },
  playBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#0284c7',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnText: { color: '#fff', fontSize: 26 },
  time: { color: '#e5e7eb', fontSize: 13 },
});
