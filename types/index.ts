// types/index.ts
// Type ที่ตรงกับ shape จริงของ API — อ้างอิง docs/API.md ในโปรเจกต์เว็บ
// อัปเดตไฟล์นี้ทุกครั้งที่ backend เปลี่ยน response shape

export type User = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  displayName?: string | null;
  avatarUrl?: string | null;
  language?: 'TH' | 'EN';
  isVerified?: boolean;
  createdAt?: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  _count?: { files: number };
};

export type FileItem = {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  ext: string;
  size: number;
  uploadedAt: string;
  userId: string;
  tags: string[]; // ชื่อ tag ล้วนๆ (ไม่ใช่ id)
  hasPassword: boolean;
  src: string; // path สัมพัทธ์ ต้องต่อ API_BASE_URL เอง (ดู resolveApiUrl ใน lib/api.ts)
};

export type ApiErrorShape = {
  error: { code: string; message: string };
};
