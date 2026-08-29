// lib/storage.ts
// เก็บ JWT token ไว้ใน secure storage ของเครื่อง (encrypted keychain/keystore) แทน localStorage
// แบบเว็บ เพราะแอป native ไม่มี cookie jar ที่ browser จัดการให้อัตโนมัติ
// หมายเหตุ: expo-secure-store ไม่รองรับ web (ไม่มี keychain ให้เรียก) เลย fallback ไป
// localStorage เฉพาะตอนรันบนเว็บ (เผื่อใครรัน `npm run web` ทดสอบ) — เป้าหมายจริงของแอปนี้คือ
// Android/iOS ผ่าน Expo Go ซึ่งจะใช้ SecureStore ตามปกติ
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const isWeb = Platform.OS === 'web';

export async function saveToken(token: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (isWeb) {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
