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

// ===== Admin (โซน (admin) เท่านั้น — ดู src/app/admin/* ฝั่งเว็บ) =====

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  storageUsedBytes: number;
  fileCount: number;
  tags: string[]; // ชื่อ tag ทั้งหมดที่ user คนนี้เคยใช้ (รวมจากทุกไฟล์)
  firstUploadAt: string | null;
  lastUploadAt: string | null;
};

export type ModerationStatus =
  | 'PENDING_SCAN'
  | 'SCANNING'
  | 'SCAN_FAILED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export type ModerationItem = {
  id: string;
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  tagIds: string | null; // JSON string ของ tag id array — parse เองก่อนใช้
  status: ModerationStatus;
  scanResult: string | null; // JSON string ดิบจาก Cloudmersive เก็บไว้เผื่อ debug/แสดงเหตุผล
  uploadedBy: string;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  uploader: { id: string; displayName: string | null; email: string } | null;
};
