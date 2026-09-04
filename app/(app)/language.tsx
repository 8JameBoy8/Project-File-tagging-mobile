// app/(app)/language.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage, Language } from '@/context/LanguageContext';

export default function LanguageScreen() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  // State สำหรับ Modal ป๊อปอัปยืนยัน (ทำงานได้ทั้ง Alert บน native และ Modal)
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectLanguage = (selected: Language) => {
    if (selected === language) return; // ภาษาปัจจุบันอยู่แล้ว

    // แสดงยืนยัน
    setTargetLang(selected);
    setModalVisible(true);
  };

  const handleConfirmChange = async () => {
    if (!targetLang) return;
    const nextLang = targetLang;
    setModalVisible(false);
    setTargetLang(null);

    await setLanguage(nextLang);

    // แสดงแจ้งเตือนและกลับไปหน้าเดิม (Setting)
    Alert.alert(
      nextLang === 'TH' ? 'สำเร็จ' : 'Success',
      nextLang === 'TH' ? 'เปลี่ยนภาษาเป็นภาษาไทยเรียบร้อยแล้ว' : 'Language switched to English successfully',
      [{ text: nextLang === 'TH' ? 'ตกลง' : 'OK', onPress: () => router.back() }]
    );
  };

  const handleCancelChange = () => {
    setModalVisible(false);
    setTargetLang(null);
  };

  const languageOptions: { key: Language; name: string; localName: string; flag: string }[] = [
    {
      key: 'TH',
      name: 'ภาษาไทย',
      localName: 'Thai',
      flag: '🇹🇭',
    },
    {
      key: 'EN',
      name: 'English',
      localName: 'English (US)',
      flag: '🇺🇸',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        {language === 'TH'
          ? 'เลือกภาษาที่ต้องการใช้แสดงผลทั่วทั้งแอพพลิเคชัน'
          : 'Choose the language to use across the entire application'}
      </Text>

      <View style={styles.card}>
        {languageOptions.map((opt, index) => {
          const isSelected = language === opt.key;
          return (
            <React.Fragment key={opt.key}>
              <TouchableOpacity
                style={[styles.optionItem, isSelected && styles.selectedItem]}
                onPress={() => handleSelectLanguage(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.flagIcon}>{opt.flag}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, isSelected && styles.selectedText]}>
                    {opt.name}
                  </Text>
                  <Text style={styles.optionSub}>{opt.localName}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioCircle} />
                )}
              </TouchableOpacity>
              {index < languageOptions.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Confirmation Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelChange}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalEmoji}>🌐</Text>
            </View>

            <Text style={styles.modalTitle}>
              {targetLang === 'TH' ? 'ยืนยันการเปลี่ยนภาษา' : 'Confirm Language Change'}
            </Text>

            <Text style={styles.modalMessage}>
              {targetLang === 'TH'
                ? 'คุณต้องการเปลี่ยนภาษาของแอพเป็น "ภาษาไทย" ใช่หรือไม่?'
                : 'Do you want to switch the app language to "English"?'}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelChange}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmChange}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, gap: 16 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 4, lineHeight: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  selectedItem: {
    backgroundColor: '#f0f9ff',
  },
  flagIcon: {
    fontSize: 32,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedText: {
    color: '#0284c7',
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 68,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmButton: {
    backgroundColor: '#0284c7',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
