# File Tagging — Mobile (Expo)

แอปมือถือของโปรเจกต์ Project-File-tagging ใช้ **backend/API ชุดเดียวกับเว็บ** ไม่มีแยก — ดู
`docs/API.md` ในโปรเจกต์เว็บสำหรับ endpoint ทั้งหมด (path, request/response shape, error code)

## เริ่มต้น

```bash
npm install
npm start
```

จากนั้นสแกน QR ด้วยแอป **Expo Go** ในมือถือ (ต้องอยู่ใน wifi/เน็ตเดียวกับเครื่องที่รัน หรือใช้ tunnel mode)

API ที่แอปนี้ยิงไปตอนนี้คือ URL ถาวรของ backend จริงที่ deploy บน Vercel แล้ว (`lib/config.ts`) — ไม่ใช่ tunnel ชั่วคราวอีกต่อไป ไม่ต้องคอยอัปเดตค่านี้เวลาปิดเครื่อง dev แล้วเหมือนก่อนหน้านี้

## โครงสร้างโฟลเดอร์

```
app/                        ← หน้าจอทั้งหมด (expo-router = file-based routing เหมือน Next.js App Router)
├── _layout.tsx              root layout ครอบทั้งแอป (AuthProvider, LanguageProvider, StatusBar)
├── index.tsx                เช็ค login แล้วพาไปหน้าที่ถูกต้องตาม role (เทียบเท่า proxy.ts ฝั่งเว็บ)
├── (auth)/                  โซนก่อน login — ไม่มีผลกับ URL แค่จัดกลุ่ม (route group)
│   ├── login.tsx             ✅ ทำงานจริงครบแล้ว
│   ├── register.tsx          ✅ ทำงานจริงครบแล้ว
│   ├── forgot-password.tsx   ✅ ทำงานจริงครบแล้ว (ขอ OTP ทางอีเมล — ดูหมายเหตุด้านล่าง)
│   └── change-password.tsx   ✅ ทำงานจริงครบแล้ว (กรอก OTP + ตั้งรหัสผ่านใหม่)
├── (app)/                   โซนที่ต้อง login แล้วเท่านั้น (เช็คใน _layout.tsx ของโซนนี้)
│   ├── (tabs)/               แท็บหลัก 5 อัน เหมือน Topbar.tsx ฝั่งเว็บเป๊ะๆ
│   │   ├── home.tsx            ✅ ทำงานจริง (ดึงไฟล์จาก API มาโชว์ list)
│   │   ├── manage-tag.tsx      🚧 TODO
│   │   ├── upload.tsx          ✅ ทำงานจริงครบแล้ว
│   │   ├── create-tag.tsx      🚧 TODO
│   │   └── setting.tsx         ✅ ทำงานจริงครบแล้ว
│   ├── profile.tsx           ✅ ทำงานจริงครบแล้ว (เปลี่ยนรูป/ชื่อ, ดูพื้นที่จัดเก็บ)
│   ├── change-password.tsx   ✅ ทำงานจริงครบแล้ว (เปลี่ยนรหัสผ่านตอน login อยู่ — คนละหน้ากับ
│   │                           (auth)/change-password.tsx ที่ใช้ตอนลืมรหัสผ่าน)
│   ├── language.tsx          ✅ ทำงานจริงครบแล้ว
│   └── file-passwords.tsx    ✅ ทำงานจริงครบแล้ว (เข้าจากปุ่มในหน้า Setting ไม่ใช่แท็บ)
└── (admin)/                 โซนของ role ADMIN เท่านั้น (เช็คใน _layout.tsx ของโซนนี้ — user ทั่วไป
    │                         ที่พยายามเข้ามาจะโดนเด้งไป (app)/(tabs)/home อัตโนมัติ เทียบเท่า
    │                         proxy.ts ที่กัน /admin/* ฝั่งเว็บ — แต่ admin ยังเข้าโซน (app) ปกติได้
    │                         เหมือนเดิม)
    └── (tabs)/               แท็บหลัก 3 อัน เหมือน AppShell.tsx ฝั่งเว็บ
        ├── home.tsx            ✅ ทำงานจริงครบแล้ว — list user ทั้งหมด + ไฟล์ทุกคน, ลบ user ได้
        ├── approve.tsx         ✅ ทำงานจริงครบแล้ว — คิวไฟล์ที่สแกนไวรัสแล้วไม่ชัวร์ว่าปลอดภัย
        └── setting.tsx         ✅ ทำงานจริงครบแล้ว — จำนวน user ทั้งหมด, เปลี่ยนภาษา, logout

components/                 UI ที่ใช้ซ้ำได้ (เพิ่มเติมได้เรื่อยๆ)
├── PrimaryButton.tsx         เทียบเท่า AuthButton.tsx ฝั่งเว็บ
└── TextField.tsx             เทียบเท่า InputField.tsx ฝั่งเว็บ

context/
├── AuthContext.tsx          จัดการ state login ทั้งแอป (useAuth() hook) — login/register/logout,
│                             แคช avatar ไว้ในเครื่องด้วย (avatarUri/updateAvatarUri)
└── LanguageContext.tsx      จัดการภาษาทั้งแอป (useLanguage() hook) — sync กับ backend
                              (PATCH /api/profile {language}) และค่าที่ user เคยตั้งไว้จากที่อื่น
                              (เช่นฝั่งเว็บ) ด้วย

lib/
├── api.ts                   fetch wrapper กลาง แนบ base URL + Authorization header อัตโนมัติ
├── config.ts                ← API_BASE_URL อยู่ตรงนี้
└── storage.ts                เก็บ JWT token แบบ secure (expo-secure-store) + cache avatar URI

types/
└── index.ts                  Type ตรงกับ shape ของ API (User, Tag, FileItem, AdminUser, ModerationItem)
```

## ที่ยังไม่เสร็จ

- **`(app)/(tabs)/manage-tag.tsx`** และ **`(app)/(tabs)/create-tag.tsx`** — ยังเป็น TODO placeholder อยู่ เปิดไฟล์ดู comment ด้านบนสำหรับ endpoint ที่ต้องใช้
- **Forgot Password ใช้กับอีเมลจริงไม่ได้ชั่วคราว** — โค้ดเรียก endpoint ถูกต้องแล้ว แต่บริการส่งอีเมล (Resend) ฝั่ง backend ยังอยู่โหมด sandbox ส่งได้แค่ไปยังอีเมลของเจ้าของบัญชีเอง (รอทีมเว็บยืนยันโดเมนของตัวเองใน Resend dashboard — ไม่ใช่บั๊กของ mobile)

## กติกาที่ควรรักษาไว้ (กันไม่ให้แต่ละคนทำคนละแบบ)

1. **เรียก API ผ่าน `apiFetch()` จาก `lib/api.ts` เสมอ** — อย่า `fetch()` ตรงๆ เพราะจะไม่มี Authorization header ให้อัตโนมัติ
2. **ดึงสถานะ login ผ่าน `useAuth()`** จาก `context/AuthContext.tsx` เท่านั้น อย่าเก็บ token/user ซ้ำที่อื่น — ภาษาใช้ `useLanguage()` จาก `context/LanguageContext.tsx` เหมือนกัน
3. หน้าจอใหม่ให้อ้างอิง type จาก `types/index.ts` — ถ้า field ไม่ตรงกับที่ backend ส่งจริง แก้ที่ไฟล์นี้ไฟล์เดียว ไม่ต้องแก้ทุกหน้าจอ
4. ปุ่ม/ช่องกรอกพื้นฐานใช้ `components/PrimaryButton.tsx` และ `components/TextField.tsx` ก่อน ถ้าจะสร้างแบบใหม่ค่อยเพิ่มเป็น component แยกใน `components/` เหมือนกัน อย่าก็อปสไตล์ inline ซ้ำๆ ในแต่ละหน้าจอ
5. **เช็ค response shape จริงจาก `docs/API.md` ก่อนเขียนโค้ดดึงข้อมูลเสมอ** — endpoint ส่วนใหญ่คืน array/object ตรงๆ ไม่มี wrapper (เช่น `GET /api/tags` คืน `Tag[]` ตรงๆ ไม่ใช่ `{tags: Tag[]}`) เคยมีบั๊กจริงเพราะสมมติ shape ผิดมาแล้ว
6. หน้าไหน TODO ให้เปิดไฟล์นั้นดู comment ด้านบนก่อน — มีลิงก์ไปหน้าเว็บต้นแบบ + endpoint ที่ต้องใช้ครบแล้ว
