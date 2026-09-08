// app/(app)/(tabs)/setting.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getAvatarUri } from '@/lib/storage';

type MenuItem = {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
};

export default function SettingScreen() {
  const { logout, user, avatarUri } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(t('logout_confirm_title'), t('logout_confirm_desc'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), style: 'destructive', onPress: logout },
    ]);
  };

  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: '👤',
      label: t('menu_profile'),
      sublabel: user?.displayName ?? user?.email ?? t('menu_profile_sub'),
      onPress: () => router.push('/(app)/profile'),
    },
    {
      id: 'file-passwords',
      icon: '🔑',
      label: t('menu_file_passwords'),
      sublabel: t('menu_file_passwords_sub'),
      onPress: () => router.push('/(app)/file-passwords'),
    },
    {
      id: 'language',
      icon: '🌐',
      label: t('menu_language'),
      sublabel: language === 'TH' ? 'ภาษาไทย (TH)' : 'English (EN)',
      onPress: () => router.push('/(app)/language' as any),
    },
    {
      id: 'logout',
      icon: '🚪',
      label: t('menu_logout'),
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t('settings_title')}</Text>

      {/* User Header Profile Card */}
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => router.push('/(app)/profile')}
        activeOpacity={0.8}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Menu Options */}
      <View style={styles.card}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, item.danger && styles.dangerText]}>
                  {item.label}
                </Text>
                {item.sublabel ? (
                  <Text style={styles.menuSublabel} numberOfLines={1}>
                    {item.sublabel}
                  </Text>
                ) : null}
              </View>
              {!item.danger && <Text style={styles.chevron}>›</Text>}
            </TouchableOpacity>
            {index < menuItems.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      <Text style={styles.versionText}>File Tagging Mobile App</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 4 },

  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  menuIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  menuSublabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  dangerText: { color: '#dc2626' },
  chevron: { fontSize: 20, color: '#9ca3af', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 62 },
  versionText: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 8 },
});
