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

// หมายเหตุ: SecureStore ออกแบบมาเก็บความลับสั้นๆ (มี limit ตาม platform เช่น ~2KB บน iOS
// Keychain) ใช้เก็บ avatar URI ตรงนี้ได้เพราะเป็นแค่ path ไฟล์ในเครื่อง (สั้นมาก ไม่ใช่ข้อมูล
// รูปจริง) ถ้าจะเปลี่ยนไปเก็บอย่างอื่นที่ยาวกว่านี้ ควรย้ายไป AsyncStorage แทน
const AVATAR_KEY_PREFIX = 'user_avatar_';

export async function saveAvatarUri(userId: string, uri: string): Promise<void> {
  const key = `${AVATAR_KEY_PREFIX}${userId}`;
  if (isWeb) {
    window.localStorage.setItem(key, uri);
    return;
  }
  await SecureStore.setItemAsync(key, uri);
}

export async function getAvatarUri(userId: string): Promise<string | null> {
  const key = `${AVATAR_KEY_PREFIX}${userId}`;
  if (isWeb) {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function clearAvatarUri(userId: string): Promise<void> {
  const key = `${AVATAR_KEY_PREFIX}${userId}`;
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

