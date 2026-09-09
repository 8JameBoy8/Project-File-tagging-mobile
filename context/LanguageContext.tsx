// context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/lib/api';
import { useAuth } from './AuthContext';

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
    delete_label: 'ลบ',
    notice_title: 'แจ้งเตือน',
    confirm_delete_title: 'ยืนยันการลบ',
    generic_error_short: 'เกิดข้อผิดพลาด',
    generic_error_retry: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
    sort_label: 'เรียงตาม',
    sort_newest: 'ใหม่สุด',
    sort_oldest: 'เก่าสุด',
    sort_by_type: 'ประเภทไฟล์',
    sort_by_name: 'ชื่อไฟล์',
    filter_tag_label: 'กรองแท็ก',
    filter_by_tag_title: 'กรองตามแท็ก',
    files_count: '{count} ไฟล์',
    no_files_found: 'ไม่พบไฟล์',
    no_tags_yet: 'ยังไม่มีแท็ก',
    clear_filter_link: 'ล้างตัวกรอง',
    select_tag_title: 'เลือกแท็ก',
    untagged_files_label: 'ไฟล์ที่ไม่มีแท็ก',
    already_tagged_label: 'มีแท็กนี้แล้ว',
    color_label: 'สี',
    tag_label: 'แท็ก',
    password_label: 'รหัสผ่าน',

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
    pwd_too_short: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร',
    change_pwd_success: 'เปลี่ยนรหัสผ่านสำเร็จ',
    change_pwd_failed: 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบรหัสผ่านปัจจุบัน',

    // Create Tag Screen
    create_tag_name_label: 'ชื่อแท็ก',
    create_tag_name_placeholder: 'ตั้งชื่อแท็ก',
    create_tag_custom_color_label: 'หรือใส่รหัสสีเอง (เช่น #4096ff)',
    create_tag_creating: 'กำลังสร้าง...',
    create_tag_submit: '+ สร้างแท็ก',
    create_tag_all_tags: 'แท็กทั้งหมด ({count})',
    create_tag_deleting: 'กำลังลบ...',
    create_tag_delete_selected: 'ลบที่เลือก ({count})',
    create_tag_select_to_delete: 'เลือกเพื่อลบ',
    create_tag_empty_hint: 'ยังไม่มีแท็ก ลองสร้างแท็กแรกของคุณด้านบนได้เลย',
    create_tag_name_required: 'กรุณาใส่ชื่อแท็ก',
    create_tag_create_failed_title: 'สร้างแท็กไม่สำเร็จ',
    create_tag_select_before_delete: 'กรุณาเลือกแท็กที่ต้องการลบก่อน (แตะที่แท็กด้านล่าง)',
    create_tag_confirm_delete_msg: 'ต้องการลบ {count} แท็กที่เลือกใช่หรือไม่?',

    // Manage Tag Screen
    manage_tag_select_prompt: 'เลือกแท็กเพื่อเพิ่มไฟล์',
    manage_tag_selected_count: '{count} เลือกแล้ว',
    manage_tag_confirm_action: 'ยืนยัน',
    manage_tag_name_label: 'ชื่อ',
    manage_tag_select_tag_first: 'กรุณาเลือกแท็กเป้าหมายก่อน (แตะปุ่มเลือกแท็กด้านบน)',
    manage_tag_select_one_file: 'กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์',
    manage_tag_add_failed_title: 'เพิ่มไฟล์เข้าแท็กไม่สำเร็จ',
    manage_tag_confirm_delete_tag: 'ต้องการลบแท็ก "{name}" ใช่หรือไม่?',
    manage_tag_delete_failed_title: 'ลบไม่สำเร็จ',
    manage_tag_save_failed_title: 'บันทึกไม่สำเร็จ',
    manage_tag_pick_hint: 'แตะไฟล์ด้านล่างเพื่อเลือกเข้าแท็ก {name}',
    manage_tag_create_tag_first: 'ยังไม่มีแท็ก ไปสร้างที่หน้า Create Tag ก่อน',

    // Home Screen
    home_locked_msg: 'ไฟล์นี้ต้องใส่รหัสผ่านก่อนดู',
    home_file_password_label: 'รหัสผ่านไฟล์',
    home_password_placeholder: 'กรอกรหัสผ่าน...',
    home_password_incorrect: 'รหัสผ่านไม่ถูกต้อง',
    home_unlock_btn: 'ปลดล็อก',
    home_no_tags: 'ไม่มีแท็ก',
    home_downloading: 'กำลังดาวน์โหลด...',
    home_download_btn: 'ดาวน์โหลด',
    home_deleting: 'กำลังลบ...',
    home_download_success_title: 'ดาวน์โหลดสำเร็จ',
    home_download_saved_at: 'บันทึกไฟล์ไว้ที่ {path}',
    home_download_failed_title: 'ดาวน์โหลดไม่สำเร็จ',
    home_confirm_delete_file: 'ต้องการลบไฟล์ "{name}" ใช่หรือไม่?',

    // Import File (Upload) Screen
    upload_description: 'แตะเพื่อเลือกไฟล์จากเครื่อง (เลือกได้หลายไฟล์)',
    upload_max_files: 'เลือกไฟล์ได้สูงสุด {count} ไฟล์ต่อครั้ง',
    upload_max_files_partial: 'เลือกไฟล์ได้สูงสุด {count} ไฟล์ต่อครั้ง เพิ่มให้แค่บางไฟล์',
    upload_file_too_big_title: 'ไฟล์ใหญ่เกินไป',
    upload_file_too_big_msg: 'ไฟล์นี้เกิน 50MB เลยไม่ถูกเพิ่ม: {names}',
    upload_pick_error_title: 'เกิดข้อผิดพลาด',
    upload_pick_error_msg: 'ไม่สามารถเลือกไฟล์ได้',
    upload_select_file_first: 'กรุณาเลือกไฟล์ก่อน',
    upload_selected_files: 'ไฟล์ที่เลือก ({count}/{max})',
    upload_file_icon_label: 'ไฟล์',
    upload_unknown_type: 'ไม่ทราบชนิดไฟล์',
    upload_password_placeholder: 'กรอกรหัสผ่าน (ไม่บังคับ)',
    upload_uploading: 'กำลังอัปโหลด...',
    upload_confirm_btn: 'ยืนยัน',
    upload_success_title: 'อัปโหลดสำเร็จ',
    upload_success_msg: 'กำลังตรวจสอบไฟล์ทั้ง {count} ไฟล์... ไฟล์จะเพิ่มให้อัตโนมัติในหน้า Home เมื่อตรวจสอบเสร็จ',
    upload_partial_title: 'อัปโหลดสำเร็จบางส่วน',
    upload_partial_msg: 'สำเร็จ {success} จาก {total} ไฟล์ ลองอัปโหลดไฟล์ที่เหลือใหม่อีกครั้ง',
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
    delete_label: 'Delete',
    notice_title: 'Notice',
    confirm_delete_title: 'Confirm Delete',
    generic_error_short: 'An error occurred',
    generic_error_retry: 'An error occurred, please try again',
    sort_label: 'Sort by',
    sort_newest: 'Newest',
    sort_oldest: 'Oldest',
    sort_by_type: 'File Type',
    sort_by_name: 'File Name',
    filter_tag_label: 'Filter Tag',
    filter_by_tag_title: 'Filter by Tag',
    files_count: '{count} files',
    no_files_found: 'No files found',
    no_tags_yet: 'No tags yet',
    clear_filter_link: 'Clear filter',
    select_tag_title: 'Select Tag',
    untagged_files_label: 'Untagged files',
    already_tagged_label: 'Already tagged',
    color_label: 'Color',
    tag_label: 'Tag',
    password_label: 'Password',

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
    pwd_too_short: 'New password must be at least 8 characters',
    change_pwd_success: 'Password changed successfully',
    change_pwd_failed: 'Failed to change password. Please check your current password',

    // Create Tag Screen
    create_tag_name_label: 'Tag Name',
    create_tag_name_placeholder: 'Enter tag name',
    create_tag_custom_color_label: 'Or enter a custom color code (e.g. #4096ff)',
    create_tag_creating: 'Creating...',
    create_tag_submit: '+ Create Tag',
    create_tag_all_tags: 'All Tags ({count})',
    create_tag_deleting: 'Deleting...',
    create_tag_delete_selected: 'Delete Selected ({count})',
    create_tag_select_to_delete: 'Select to Delete',
    create_tag_empty_hint: 'No tags yet — create your first one above',
    create_tag_name_required: 'Please enter a tag name',
    create_tag_create_failed_title: 'Failed to create tag',
    create_tag_select_before_delete: 'Please select tags to delete first (tap the tags below)',
    create_tag_confirm_delete_msg: 'Delete {count} selected tag(s)?',

    // Manage Tag Screen
    manage_tag_select_prompt: 'Select a tag to add files',
    manage_tag_selected_count: '{count} selected',
    manage_tag_confirm_action: 'Confirm',
    manage_tag_name_label: 'Name',
    manage_tag_select_tag_first: 'Please select a target tag first (tap the tag selector above)',
    manage_tag_select_one_file: 'Please select at least 1 file',
    manage_tag_add_failed_title: 'Failed to add files to tag',
    manage_tag_confirm_delete_tag: 'Delete tag "{name}"?',
    manage_tag_delete_failed_title: 'Failed to delete',
    manage_tag_save_failed_title: 'Failed to save',
    manage_tag_pick_hint: 'Tap files below to add them to tag {name}',
    manage_tag_create_tag_first: 'No tags yet — create one on the Create Tag page first',

    // Home Screen
    home_locked_msg: 'This file requires a password to view',
    home_file_password_label: 'File Password',
    home_password_placeholder: 'Enter password...',
    home_password_incorrect: 'Incorrect password',
    home_unlock_btn: 'Unlock',
    home_no_tags: 'No tags',
    home_downloading: 'Downloading...',
    home_download_btn: 'Download',
    home_deleting: 'Deleting...',
    home_download_success_title: 'Download Complete',
    home_download_saved_at: 'File saved at {path}',
    home_download_failed_title: 'Download Failed',
    home_confirm_delete_file: 'Delete file "{name}"?',

    // Import File (Upload) Screen
    upload_description: 'Tap to select files from your device (multiple allowed)',
    upload_max_files: 'You can select up to {count} files at a time',
    upload_max_files_partial: 'You can select up to {count} files at a time — only some files were added',
    upload_file_too_big_title: 'File Too Large',
    upload_file_too_big_msg: 'These files exceed 50MB and were not added: {names}',
    upload_pick_error_title: 'Error',
    upload_pick_error_msg: 'Unable to select files',
    upload_select_file_first: 'Please select a file first',
    upload_selected_files: 'Selected Files ({count}/{max})',
    upload_file_icon_label: 'FILE',
    upload_unknown_type: 'Unknown type',
    upload_password_placeholder: 'Enter password (optional)',
    upload_uploading: 'Uploading...',
    upload_confirm_btn: 'Confirm',
    upload_success_title: 'Upload Successful',
    upload_success_msg: "Scanning all {count} files... they'll appear automatically on the Home page once scanning is done",
    upload_partial_title: 'Partially Uploaded',
    upload_partial_msg: 'Succeeded {success} out of {total} files — try uploading the rest again',
  },
};

export type TranslationKey = keyof typeof translations.TH;

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  // values รองรับ placeholder แบบ {count}/{name} ในข้อความ (เหมือนกับ t() ฝั่งเว็บ — ดู
  // src/context/LanguageContext.jsx) ใช้แทนการต่อประโยคเองด้วย prefix/suffix หลายคีย์แยกกัน
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('TH');
  // LanguageProvider อยู่ใน AuthProvider (ดู app/_layout.tsx) เลยเรียก useAuth() ได้
  const { user } = useAuth();
  // เอาไว้ sync ค่าจาก backend มาใช้แค่ครั้งแรกที่ user โหลดเสร็จเท่านั้น ไม่งั้นถ้า sync ทุกครั้งที่
  // user เปลี่ยน จะทับค่าที่ผู้ใช้เพิ่งสลับภาษาเองกลางเซสชันโดยไม่ตั้งใจ
  const appliedServerLang = useRef(false);

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

  // ครั้งแรกที่รู้ว่า user เป็นใคร (login/เปิดแอปแล้ว auth เช็คเสร็จ) ถ้า backend มีค่าภาษาที่ user
  // เคยตั้งไว้ (เช่น ตั้งจากฝั่งเว็บ) ให้ใช้ค่านั้นแทน — กัน mobile เครื่องใหม่/ยังไม่เคยเปิดเห็นเป็น
  // ค่า default TH ทั้งที่ user เลือกภาษาอื่นไว้แล้วจากที่อื่น
  useEffect(() => {
    if (!user?.language || appliedServerLang.current) return;
    appliedServerLang.current = true;
    setLanguageState(user.language);
    SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, user.language).catch(() => {});
  }, [user?.language]);

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
    (key: TranslationKey, values?: Record<string, string | number>): string => {
      const langDict = translations[language] || translations.TH;
      let text = langDict[key] || translations.TH[key] || key;
      // รองรับ placeholder แบบ {count}/{name} ในข้อความ (เหมือน t() ฝั่งเว็บ)
      if (values) {
        for (const valueKey of Object.keys(values)) {
          text = text.replace(`{${valueKey}}`, String(values[valueKey]));
        }
      }
      return text;
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
