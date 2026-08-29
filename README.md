# File Tagging — Mobile (Expo)

แอปมือถือของโปรเจกต์ Project-File-tagging ใช้ **backend/API ชุดเดียวกับเว็บ** ไม่มีแยก — ดู
`docs/API.md` ในโปรเจกต์เว็บสำหรับ endpoint ทั้งหมด (path, request/response shape, error code)

## เริ่มต้น

```bash
npm install
npm start
```

จากนั้นสแกน QR ด้วยแอป **Expo Go** ในมือถือ (ต้องอยู่ใน wifi/เน็ตเดียวกับเครื่องที่รัน หรือใช้ tunnel mode)

API ที่แอปนี้ยิงไปตอนนี้ชี้ไปที่ tunnel ชั่วคราว (`lib/config.ts`) — **ถ้า URL เปลี่ยนหรือหมดอายุ ให้แก้ค่า `API_BASE_URL` ในไฟล์นั้นไฟล์เดียว** ไม่ต้องไล่แก้ทั้งโปรเจกต์

## โครงสร้างโฟลเดอร์

```
app/                        ← หน้าจอทั้งหมด (expo-router = file-based routing เหมือน Next.js App Router)
├── _layout.tsx              root layout ครอบทั้งแอป (AuthProvider, StatusBar)
├── index.tsx                เช็ค login แล้วพาไปหน้าที่ถูกต้อง (เทียบเท่า proxy.ts ฝั่งเว็บ)
├── (auth)/                  โซนก่อน login — ไม่มีผลกับ URL แค่จัดกลุ่ม (route group)
│   ├── login.tsx             ✅ ตัวอย่างทำงานจริงครบแล้ว ใช้เป็นแบบ
│   ├── register.tsx          ✅ ทำงานจริงครบแล้ว
│   ├── forgot-password.tsx   🚧 TODO — มี comment บอก flow ในไฟล์
│   └── change-password.tsx   🚧 TODO
└── (app)/                   โซนที่ต้อง login แล้วเท่านั้น (เช็คใน _layout.tsx ของโซนนี้)
    ├── (tabs)/               แท็บหลัก 5 อัน เหมือน Topbar.tsx ฝั่งเว็บเป๊ะๆ
    │   ├── home.tsx            ✅ ตัวอย่างทำงานจริง (ดึงไฟล์จาก API มาโชว์ list)
    │   ├── manage-tag.tsx      🚧 TODO
    │   ├── upload.tsx          🚧 TODO
    │   ├── create-tag.tsx      🚧 TODO
    │   └── setting.tsx         ✅ logout ทำงานจริง + ปุ่มไป profile/file-passwords
    ├── profile.tsx           🚧 TODO (เข้าจากปุ่มในหน้า Setting ไม่ใช่แท็บ)
    └── file-passwords.tsx    🚧 TODO (เข้าจากปุ่มในหน้า Setting ไม่ใช่แท็บ)

components/                 UI ที่ใช้ซ้ำได้ (เพิ่มเติมได้เรื่อยๆ)
├── PrimaryButton.tsx         เทียบเท่า AuthButton.tsx ฝั่งเว็บ
└── TextField.tsx             เทียบเท่า InputField.tsx ฝั่งเว็บ

context/
└── AuthContext.tsx          จัดการ state login ทั้งแอป (useAuth() hook) — login/register/logout พร้อมใช้

lib/
├── api.ts                   fetch wrapper กลาง แนบ base URL + Authorization header อัตโนมัติ
├── config.ts                ← API_BASE_URL อยู่ตรงนี้
└── storage.ts                เก็บ JWT token แบบ secure (expo-secure-store)

types/
└── index.ts                  Type ตรงกับ shape ของ API (User, Tag, FileItem)
```

## กติกาที่ควรรักษาไว้ (กันไม่ให้แต่ละคนทำคนละแบบ)

1. **เรียก API ผ่าน `apiFetch()` จาก `lib/api.ts` เสมอ** — อย่า `fetch()` ตรงๆ เพราะจะไม่มี Authorization header ให้อัตโนมัติ
2. **ดึงสถานะ login ผ่าน `useAuth()`** จาก `context/AuthContext.tsx` เท่านั้น อย่าเก็บ token/user ซ้ำที่อื่น
3. หน้าจอใหม่ให้อ้างอิง type จาก `types/index.ts` — ถ้า field ไม่ตรงกับที่ backend ส่งจริง แก้ที่ไฟล์นี้ไฟล์เดียว ไม่ต้องแก้ทุกหน้าจอ
4. ปุ่ม/ช่องกรอกพื้นฐานใช้ `components/PrimaryButton.tsx` และ `components/TextField.tsx` ก่อน ถ้าจะสร้างแบบใหม่ค่อยเพิ่มเป็น component แยกใน `components/` เหมือนกัน อย่าก็อปสไตล์ inline ซ้ำๆ ในแต่ละหน้าจอ
5. หน้าไหน TODO ให้เปิดไฟล์นั้นดู comment ด้านบนก่อน — มีลิงก์ไปหน้าเว็บต้นแบบ + endpoint ที่ต้องใช้ครบแล้ว
