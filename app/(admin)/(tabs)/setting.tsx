import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type StatsResponse = {
  totalUsers: number;
};

export default function AdminSettingScreen() {
  const { user, logout } = useAuth();

  const [language, setLanguage] = useState<'TH' | 'EN'>('TH');
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  const isThai = language === 'TH';

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response =
        await apiFetch<StatsResponse>(
          '/api/admin/stats',
        );

      setTotalUsers(response.totalUsers ?? 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert(
      isThai ? 'ออกจากระบบ' : 'Logout',
      isThai
        ? 'ต้องการออกจากระบบหรือไม่?'
        : 'Are you sure you want to logout?',
      [
        {
          text: isThai ? 'ยกเลิก' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isThai ? 'ออกจากระบบ' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(
                isThai ? 'เกิดข้อผิดพลาด' : 'Error',
                error instanceof Error
                  ? error.message
                  : 'Logout failed',
              );
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName ?? 'A')
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            {isThai ? 'Admin Setting' : 'Admin Setting'}
          </Text>

          <Text style={styles.email}>
            {user?.email ?? '-'}
          </Text>
        </View>
      </View>

      {/* LANGUAGE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isThai ? 'ภาษา' : 'Language'}
        </Text>

        <Text style={styles.cardDescription}>
          {isThai
            ? 'เลือกภาษาที่ต้องการใช้ในระบบ'
            : 'Choose the language for the system'}
        </Text>

        <View style={styles.languageRow}>
          <Pressable
            style={[
              styles.languageButton,
              language === 'TH' &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('TH')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'TH' &&
                  styles.languageTextActive,
              ]}
            >
              ภาษาไทย
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.languageButton,
              language === 'EN' &&
                styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('EN')}
          >
            <Text
              style={[
                styles.languageText,
                language === 'EN' &&
                  styles.languageTextActive,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>
      </View>

      {/* STATISTICS */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isThai ? 'ข้อมูลระบบ' : 'System Information'}
        </Text>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statIconText}>U</Text>
          </View>

          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>
              {isThai
                ? 'ผู้ใช้ทั้งหมด'
                : 'Total Users'}
            </Text>

            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.statValue}>
                {totalUsers}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ACCOUNT */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isThai ? 'บัญชี' : 'Account'}
        </Text>

        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>
            {isThai ? 'ชื่อ' : 'Name'}
          </Text>

          <Text style={styles.accountValue}>
            {user?.displayName ?? '-'}
          </Text>
        </View>

        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>
            Email
          </Text>

          <Text style={styles.accountValue}>
            {user?.email ?? '-'}
          </Text>
        </View>

        <View style={styles.accountRow}>
          <Text style={styles.accountLabel}>
            Role
          </Text>

          <Text style={styles.adminRole}>
            ADMIN
          </Text>
        </View>
      </View>

      {/* LOGOUT */}
      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          {isThai
            ? '→  ออกจากระบบ'
            : '→  Logout'}
        </Text>
      </Pressable>

      <Text style={styles.currentLanguage}>
        {isThai
          ? 'ภาษาปัจจุบัน: ภาษาไทย'
          : 'Current Language: English'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  email: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  languageRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 8,
  },

  languageButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  languageButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },

  languageText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },

  languageTextActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },

  statCard: {
    marginTop: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '800',
  },

  statInfo: {
    marginLeft: 12,
  },

  statLabel: {
    color: '#64748B',
    fontSize: 12,
  },

  statValue: {
    marginTop: 3,
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },

  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  accountLabel: {
    color: '#64748B',
    fontSize: 13,
  },

  accountValue: {
    flex: 1,
    marginLeft: 15,
    textAlign: 'right',
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },

  adminRole: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 12,
  },

  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },

  logoutText: {
    color: '#DC2626',
    fontWeight: '800',
  },

  currentLanguage: {
    textAlign: 'center',
    marginTop: 18,
    color: '#64748B',
    fontSize: 12,
  },
});