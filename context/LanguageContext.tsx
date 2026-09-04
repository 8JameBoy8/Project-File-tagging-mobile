// context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/lib/api';

export type Language = 'TH' | 'EN';

const LANGUAGE_STORAGE_KEY = 'user_app_language';

const translations = {
  TH: {
    // Common
    cancel: 'ยกเลิก',
    confirm: 'ตกลง',
    save: 'บันทึก',
    saving: 'กำลังบันทึก...',
    success: 'สำเร็จ',
    error: 'ข้อผิดพลาด',
    loading: 'กำลังโหลด...',
    
    // Tabs
    tab_home: 'หน้าหลัก',
    tab_manage_tag: 'จัดการแท็ก',
    tab_import_file: 'นำเข้าไฟล์',
    tab_create_tag: 'สร้างแท็ก',
    tab_setting: 'ตั้งค่า',

    // Setting Screen
    settings_title: 'การตั้งค่า',
    menu_profile: 'ข้อมูลส่วนตัว',
    menu_profile_sub: 'ดูและแก้ไขโปรไฟล์ของคุณ',
    menu_file_passwords: 'รหัสผ่านไฟล์',
    menu_file_passwords_sub: 'จัดการรหัสผ่านของไฟล์ที่ถูกล็อก',
    menu_language: 'ภาษา / Language',
    menu_language_sub: 'ภาษาไทย (TH)',
    menu_logout: 'ออกจากระบบ',
    logout_confirm_title: 'ออกจากระบบ',
    logout_confirm_desc: 'ต้องการออกจากระบบใช่หรือไม่?',

    // Language Screen
    language_screen_title: 'เลือกภาษา',
    lang_thai: 'ภาษาไทย',
    lang_thai_desc: 'ภาษาไทย (TH)',
    lang_english: 'English',
    lang_english_desc: 'อังกฤษ (EN)',
    lang_confirm_title: 'ยืนยันการเปลี่ยนภาษา',
    lang_confirm_desc_to_th: 'คุณต้องการเปลี่ยนภาษาของแอพเป็น "ภาษาไทย" ใช่หรือไม่?',
    lang_confirm_desc_to_en: 'คุณต้องการเปลี่ยนภาษาของแอพเป็น "English" ใช่หรือไม่?',
    lang_changed_toast: 'เปลี่ยนภาษาเรียบร้อยแล้ว',

    // Profile Screen
    profile_title: 'โปรไฟล์',
    change_photo: 'เปลี่ยนรูปโปรไฟล์',
    tap_to_change_photo: 'แตะเพื่อเปลี่ยนรูป',
    choose_from_gallery: 'เลือกรูปภาพจากเครื่อง',
    remove_photo: 'ลบรูปโปรไฟล์',
    personal_info: 'ข้อมูลส่วนตัว',
    display_name: 'ชื่อที่แสดง',
    display_name_placeholder: 'ระบุชื่อที่แสดง',
    email: 'อีเมล',
    storage_section: 'พื้นที่จัดเก็บ',
    storage_error: 'ไม่สามารถโหลดข้อมูลพื้นที่ได้',
    save_profile_btn: 'บันทึกข้อมูล',
    saving_profile_btn: 'กำลังบันทึก...',
    profile_save_success: 'บันทึกข้อมูลสำเร็จ',
    profile_save_failed: 'บันทึกไม่สำเร็จ กรุณาลองใหม่',
    security_section: 'ความปลอดภัย',
    change_password_btn: 'เปลี่ยนรหัสผ่านบัญชี',

    // File Passwords Screen
    verify_title: 'ยืนยันตัวตน',
    verify_subtitle: 'กรอกรหัสผ่านบัญชีของคุณเพื่อเข้าถึงรหัสผ่านไฟล์',
    account_password: 'รหัสผ่านบัญชี',
    verify_btn: 'ยืนยัน',
    verifying_btn: 'กำลังตรวจสอบ...',
    password_empty: 'กรุณากรอกรหัสผ่าน',
    password_wrong: 'รหัสผ่านไม่ถูกต้อง',
    file_passwords_list_title: 'รหัสผ่านไฟล์',
    no_files_with_password: 'ไม่พบไฟล์ที่ตั้งรหัสผ่านไว้',
    view_pwd: 'ดูรหัส',
    change_pwd: 'เปลี่ยนรหัส',
    hide_pwd: 'ซ่อน',
    modal_change_pwd_title: 'เปลี่ยนรหัสผ่านไฟล์',
    modal_new_pwd_placeholder: 'รหัสผ่านใหม่',

    // Change Password Screen
    change_pwd_screen_title: 'เปลี่ยนรหัสผ่าน',
    change_pwd_subtitle: 'กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ของคุณ',
    current_password: 'รหัสผ่านปัจจุบัน',
    new_password: 'รหัสผ่านใหม่',
    confirm_new_password: 'ยืนยันรหัสผ่านใหม่',
    pwd_mismatch: 'รหัสผ่านใหม่ไม่ตรงกัน',
    pwd_required: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    change_pwd_success: 'เปลี่ยนรหัสผ่านสำเร็จ',
    change_pwd_failed: 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านปัจจุบัน',
  },
  EN: {
    // Common
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    saving: 'Saving...',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',

    // Tabs
    tab_home: 'Home',
    tab_manage_tag: 'Manage Tag',
    tab_import_file: 'Import File',
    tab_create_tag: 'Create Tag',
    tab_setting: 'Setting',

    // Setting Screen
    settings_title: 'Settings',
    menu_profile: 'Profile',
    menu_profile_sub: 'Manage your profile and display name',
    menu_file_passwords: 'File Passwords',
    menu_file_passwords_sub: 'Manage passwords for protected files',
    menu_language: 'Language / ภาษา',
    menu_language_sub: 'English (EN)',
    menu_logout: 'Log Out',
    logout_confirm_title: 'Log Out',
    logout_confirm_desc: 'Are you sure you want to log out?',

    // Language Screen
    language_screen_title: 'Language',
    lang_thai: 'ภาษาไทย',
    lang_thai_desc: 'Thai (TH)',
    lang_english: 'English',
    lang_english_desc: 'English (EN)',
    lang_confirm_title: 'Confirm Language Change',
    lang_confirm_desc_to_th: 'Do you want to switch the app language to "ภาษาไทย"?',
    lang_confirm_desc_to_en: 'Do you want to switch the app language to "English"?',
    lang_changed_toast: 'Language changed successfully',

    // Profile Screen
    profile_title: 'Profile',
    change_photo: 'Change Profile Photo',
    tap_to_change_photo: 'Tap to change photo',
    choose_from_gallery: 'Choose from Gallery',
    remove_photo: 'Remove Photo',
    personal_info: 'Personal Information',
    display_name: 'Display Name',
    display_name_placeholder: 'Enter display name',
    email: 'Email',
    storage_section: 'Storage Usage',
    storage_error: 'Unable to load storage info',
    save_profile_btn: 'Save Changes',
    saving_profile_btn: 'Saving...',
    profile_save_success: 'Profile updated successfully',
    profile_save_failed: 'Failed to update profile, please try again',
    security_section: 'Security',
    change_password_btn: 'Change Account Password',

    // File Passwords Screen
    verify_title: 'Verify Identity',
    verify_subtitle: 'Enter your account password to access file passwords',
    account_password: 'Account Password',
    verify_btn: 'Verify',
    verifying_btn: 'Verifying...',
    password_empty: 'Please enter your password',
    password_wrong: 'Incorrect password',
    file_passwords_list_title: 'File Passwords',
    no_files_with_password: 'No password-protected files found',
    view_pwd: 'View',
    change_pwd: 'Change',
    hide_pwd: 'Hide',
    modal_change_pwd_title: 'Change File Password',
    modal_new_pwd_placeholder: 'New password',

    // Change Password Screen
    change_pwd_screen_title: 'Change Password',
    change_pwd_subtitle: 'Enter your current password and choose a new password',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_new_password: 'Confirm New Password',
    pwd_mismatch: 'New passwords do not match',
    pwd_required: 'Please fill in all fields',
    change_pwd_success: 'Password changed successfully',
    change_pwd_failed: 'Failed to change password. Please check your current password',
  },
};

export type TranslationKey = keyof typeof translations.TH;

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('TH');

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        if (savedLang === 'TH' || savedLang === 'EN') {
          setLanguageState(savedLang);
        }
      } catch {
        // Fallback to TH default
      }
    })();
  }, []);

  const setLanguage = useCallback(async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, newLang);
      // ซิงค์กับ backend ในเบื้องหลังถ้าทำได้
      apiFetch('/api/profile', {
        method: 'PATCH',
        body: { language: newLang },
      }).catch(() => {});
    } catch {
      // Ignored
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const langDict = translations[language] || translations.TH;
      return langDict[key] || translations.TH[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
