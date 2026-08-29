// lib/api.ts
// fetch wrapper กลาง — แนบ base URL + Authorization header ให้อัตโนมัติทุก request
// อ้างอิง endpoint ทั้งหมดที่ docs/API.md ในโปรเจกต์เว็บ (Project-File-tagging)
import { API_BASE_URL } from './config';
import { getToken } from './storage';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown; // จะถูกแปลงเป็น JSON อัตโนมัติ ยกเว้นเป็น FormData อยู่แล้ว
};

/**
 * เรียก API แบบ JSON ทั่วไป — แนบ token อัตโนมัติถ้ามี, throw ApiError ถ้า response ไม่ ok
 * ตัวอย่าง: await apiFetch('/api/tags')
 *          await apiFetch('/api/tags', { method: 'POST', body: { name: 'Work', color: '#4096ff' } })
 */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : isFormData ? (options.body as FormData) : JSON.stringify(options.body),
  });

  // /api/files/[id]/serve และ /download คืน binary ไม่ใช่ JSON — เรียกแยกด้วย apiFetchBlob แทน
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const code = data?.error?.code ?? 'UNKNOWN_ERROR';
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, code, message);
  }

  return data as T;
}

/** เรียก endpoint ที่คืนไฟล์จริง (เช่น /api/files/[id]/serve) — ใช้ตอนโหลดรูป/วิดีโอ */
export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, 'FETCH_FAILED', `Failed to load ${path}`);
  return res.blob();
}

/** ต่อ base URL ให้ path สัมพัทธ์ที่ API ส่งมา (เช่น field `src` ของไฟล์) */
export function resolveApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
