// app/(admin)/(tabs)/home.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { AdminUser, FileItem, ModerationItem } from '@/types';

type UsersResponse = {
  users: AdminUser[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type ModerationResponse = {
  items: ModerationItem[];
};

type UserFilesResponse = {
  files: FileItem[];
};

export default function AdminHomeScreen() {
  const { user } = useAuth();
  // ตรงกับ pattern ที่หน้า Admin Setting ใช้อยู่แล้ว (isThai แบบ inline ternary ไม่ผ่านคีย์กลาง
  // ของ LanguageContext) — หน้านี้เดิมเป็นภาษาอังกฤษล้วน ไม่เคยเชื่อมกับสวิตช์ภาษาเลย
  const { language } = useLanguage();
  const isThai = language === 'TH';

  const [users, setUsers] = useState<AdminUser[]>([]);
  // moderation queue ทั้งระบบ — ใช้แค่โชว์ตัวเลขรวมใน stat card ด้านบน ("Files")
  const [files, setFiles] = useState<ModerationItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ไฟล์จริงของ user ที่เลือกอยู่ (ตาราง File จริง ไม่ใช่ moderation queue — ดูคอมเมนต์ที่
  // loadUserFiles ด้านล่างว่าทำไมต้องแยกจาก `files` ข้างบน)
  const [userFiles, setUserFiles] = useState<FileItem[]>([]);
  const [userFilesLoading, setUserFilesLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * ============================================================
   * FETCH USERS + FILES
   * ============================================================
   */

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [usersResponse, moderationResponse] =
        await Promise.all([
          apiFetch<UsersResponse>(
            '/api/admin/user?limit=100'
          ),
          apiFetch<ModerationResponse>(
            '/api/admin/moderation?status=all'
          ),
        ]);

      // เอาบัญชี admin ที่ล็อกอินอยู่ตอนนี้ออกจากลิสต์ — หน้านี้มีไว้จัดการ "ผู้ใช้คนอื่น" ไม่ใช่
      // ตัวเอง เห็นตัวเองโผล่ในลิสต์พร้อมปุ่มลบทำให้เข้าใจผิดว่าลบตัวเองได้ (ถึงจริงๆแล้ว backend
      // กันไว้อยู่แล้ว ลบตัวเองไม่ได้แน่ๆ — ดู deleteUser() ด้านล่าง แต่ซ่อนไปเลยชัดเจนกว่า)
      const nextUsers = (usersResponse.users ?? []).filter(
        (item) => item.id !== user?.id
      );
      const nextFiles = moderationResponse.items ?? [];

      setUsers(nextUsers);
      setFiles(nextFiles);

      /*
       * เลือก User คนแรกเป็นค่าเริ่มต้น
       *
       * ถ้ามี selectedUserId เดิมอยู่และ user คนนั้นยังมีอยู่
       * ให้คง user เดิมไว้
       */
      setSelectedUserId((currentSelectedId) => {
        if (
          currentSelectedId &&
          nextUsers.some(
            (item) => item.id === currentSelectedId
          )
        ) {
          return currentSelectedId;
        }

        return nextUsers[0]?.id ?? null;
      });
    } catch (err) {
      console.error('Admin Home load error:', err);

      setError(
        err instanceof Error
          ? err.message
          : (isThai ? 'ไม่สามารถโหลดข้อมูลได้' : 'Failed to load data')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, isThai]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * ============================================================
   * SELECTED USER
   * ============================================================
   */

  const selectedUser =
    users.find(
      (item) => item.id === selectedUserId
    ) ?? null;

  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  /*
   * ============================================================
   * DELETE USER
   * ============================================================
   */

  const handleDeleteUser = () => {
    if (!selectedUser) {
      return;
    }

    Alert.alert(
      isThai ? 'ลบผู้ใช้' : 'Delete User',
      isThai
        ? `ต้องการลบ ${getUserDisplayName(selectedUser)} หรือไม่?`
        : `Delete ${getUserDisplayName(selectedUser)}?`,
      [
        {
          text: isThai ? 'ยกเลิก' : 'Cancel',
          style: 'cancel',
        },
        {
          text: isThai ? 'ลบ' : 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(),
        },
      ]
    );
  };

  const deleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    /*
     * API ฝั่ง backend กันการลบตัวเองไว้แล้ว
     * แต่ตรวจเพิ่มตรงนี้เพื่อไม่ให้ admin กดพลาด
     */
    if (selectedUser.id === user?.id) {
      Alert.alert(
        isThai ? 'ไม่สามารถลบได้' : 'Cannot Delete',
        isThai ? 'ไม่สามารถลบบัญชีของตัวเองได้' : 'You cannot delete your own account'
      );
      return;
    }

    try {
      setDeleting(true);

      await apiFetch(
        `/api/admin/user/${selectedUser.id}`,
        {
          method: 'DELETE',
        }
      );

      const deletedId = selectedUser.id;

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item.id !== deletedId
        )
      );

      /*
       * เลือก user คนแรกที่เหลืออยู่
       */
      setSelectedUserId((currentSelectedId) => {
        if (currentSelectedId !== deletedId) {
          return currentSelectedId;
        }

        const remainingUsers = users.filter(
          (item) => item.id !== deletedId
        );

        return remainingUsers[0]?.id ?? null;
      });

      Alert.alert(
        isThai ? 'สำเร็จ' : 'Success',
        isThai ? 'ลบ User เรียบร้อยแล้ว' : 'User deleted successfully'
      );
    } catch (err) {
      console.error('Delete user error:', err);

      Alert.alert(
        isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        err instanceof Error
          ? err.message
          : (isThai ? 'ไม่สามารถลบ User ได้' : 'Failed to delete user')
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * ไฟล์ของ user ที่เลือกอยู่
   * ============================================================
   *
   * ใช้ GET /api/admin/user/[id]/files (ตาราง File จริง) แทน moderation queue —
   * moderation queue เก็บ tagIds ไว้แค่ ณ ตอนอัปโหลดเท่านั้น ไม่อัปเดตตามหลังเวลา user ไป
   * เพิ่ม/ลบแท็กทีหลังผ่านหน้า "จัดการแท็ก" เลยเจอว่าชื่อไฟล์/จำนวนแท็กที่โชว์ไม่ตรงกับความ
   * เป็นจริงปัจจุบัน (เจอจริงตอนทดสอบ) endpoint นี้อ่านจากตาราง File ตรงๆ เลยตรงกับปัจจุบันเสมอ
   */

  const loadUserFiles = useCallback(async (userId: string) => {
    setUserFilesLoading(true);
    try {
      const data = await apiFetch<UserFilesResponse>(
        `/api/admin/user/${userId}/files`
      );
      setUserFiles(data.files ?? []);
    } catch (err) {
      console.error('Load user files error:', err);
      setUserFiles([]);
    } finally {
      setUserFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserFiles(selectedUserId);
    } else {
      setUserFiles([]);
    }
  }, [selectedUserId, loadUserFiles]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />

          <Text style={styles.loadingText}>
            {isThai ? 'กำลังโหลดข้อมูล...' : 'Loading data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            {isThai ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load data'}
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryText}>
              {isThai ? 'ลองใหม่' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {isThai ? 'แผงควบคุมแอดมิน' : 'Admin Dashboard'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {isThai ? 'จัดการผู้ใช้และไฟล์' : 'Manage users and files'}
            </Text>
          </View>

          <View style={styles.adminIcon}>
            <Text style={styles.adminIconText}>
              A
            </Text>
          </View>
        </View>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.length}
            </Text>

            <Text style={styles.statLabel}>
              {isThai ? 'ผู้ใช้' : 'Users'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {files.length}
            </Text>

            <Text style={styles.statLabel}>
              {isThai ? 'ไฟล์' : 'Files'}
            </Text>
          </View>
        </View>

        {/* =====================================================
            SELECTED USER
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isThai ? 'ผู้ใช้ที่เลือก' : 'Selected User'}
          </Text>
        </View>

        {selectedUser ? (
          <View style={styles.userCard}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileText}>
                {getUserInitial(selectedUser)}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {getUserDisplayName(selectedUser)}
              </Text>

              <DetailRow
                label={isThai ? 'อีเมล' : 'Email'}
                value={getUserEmail(selectedUser)}
              />

              <DetailRow
                label="ID"
                value={selectedUser.id}
              />

              <DetailRow
                label={isThai ? 'ไฟล์' : 'Files'}
                value={String(
                  getUserFileCount(selectedUser)
                )}
              />

              <DetailRow
                label={isThai ? 'พื้นที่ใช้งาน' : 'Storage'}
                value={formatBytes(selectedUser.storageUsedBytes)}
              />

              <View style={styles.tagsDetailRow}>
                <Text style={styles.detailLabel}>{isThai ? 'แท็ก' : 'Tags'}</Text>
                <View style={styles.tagsDetailChips}>
                  {selectedUser.tags.length === 0 ? (
                    <Text style={styles.detailValue}>-</Text>
                  ) : (
                    selectedUser.tags.map((tagName) => (
                      <View key={tagName} style={styles.tagChipSmall}>
                        <Text style={styles.tagChipSmallText}>{tagName}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                deleting && styles.disabledButton,
              ]}
              disabled={deleting}
              onPress={handleDeleteUser}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#DC2626"
                />
              ) : (
                <Text style={styles.deleteText}>
                  {isThai ? 'ลบ' : 'Delete'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {isThai ? 'ยังไม่มี User' : 'No users yet'}
            </Text>
          </View>
        )}

        {/* =====================================================
            USER LIST
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isThai ? 'ผู้ใช้' : 'Users'}
          </Text>

          <Text style={styles.sectionCount}>
            {isThai ? `${users.length} คน` : `${users.length} users`}
          </Text>
        </View>

        {users.length > 0 ? (
          users.map((item) => {
            const isSelected =
              item.id === selectedUserId;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.userListCard,
                  isSelected &&
                    styles.selectedUserCard,
                ]}
                onPress={() =>
                  setSelectedUserId(item.id)
                }
                activeOpacity={0.75}
              >
                <View style={styles.smallAvatar}>
                  <Text
                    style={styles.smallAvatarText}
                  >
                    {getUserInitial(item)}
                  </Text>
                </View>

                <View style={styles.userListInfo}>
                  <Text
                    style={styles.userListName}
                    numberOfLines={1}
                  >
                    {getUserDisplayName(item)}
                  </Text>

                  <Text
                    style={styles.userListEmail}
                    numberOfLines={1}
                  >
                    {getUserEmail(item)}
                  </Text>
                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {isThai ? 'ไม่พบ User' : 'No users found'}
            </Text>
          </View>
        )}

        {/* =====================================================
            FILES OF SELECTED USER
            (ไฟล์จริงของ user ที่เลือกอยู่ด้านบน — ไม่ใช่ไฟล์ของทุกคนแล้ว
            เดิมกดไฟล์เพื่อสลับ selected user แต่ผู้ใช้งานจริงมองว่าย้อนทางและซ้ำซ้อน
            เพราะเลือก user ได้จากลิสต์ Users ด้านบนอยู่แล้ว)
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedUser
              ? (isThai
                  ? `ไฟล์ของ ${getUserDisplayName(selectedUser)}`
                  : `Files of ${getUserDisplayName(selectedUser)}`)
              : (isThai ? 'ไฟล์' : 'Files')}
          </Text>

          <Text style={styles.sectionCount}>
            {isThai ? `${userFiles.length} ไฟล์` : `${userFiles.length} files`}
          </Text>
        </View>

        {userFilesLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" />
          </View>
        ) : userFiles.length > 0 ? (
          userFiles.map((file) => (
            <View key={file.id} style={styles.fileCard}>
              <View style={styles.fileIcon}>
                <Text
                  style={styles.fileIconText}
                >
                  {file.ext}
                </Text>
              </View>

              <View style={styles.fileInfo}>
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                >
                  {file.name}
                </Text>

                <Text
                  style={styles.fileMeta}
                  numberOfLines={2}
                >
                  {formatBytes(file.size)}
                  {' • '}
                  {file.tags.length > 0
                    ? file.tags.join(', ')
                    : (isThai ? 'ไม่มีแท็ก' : 'no tags')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {selectedUser
                ? (isThai ? 'ยังไม่มีไฟล์' : 'No files yet')
                : (isThai ? 'ไม่พบไฟล์' : 'No files found')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * ==============================================================
 * DETAIL ROW
 * ==============================================================
 */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text
        style={styles.detailValue}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

/*
 * ==============================================================
 * TYPE-SAFE HELPERS
 * ==============================================================
 *
 * เนื่องจาก type ของ backend อาจมีชื่อ field ต่างกันตาม version
 * ฟังก์ชันเหล่านี้ช่วยให้หน้า UI ไม่ต้องกระจาย logic ไปทั่วไฟล์
 */

function getUserDisplayName(
  user: AdminUser
): string {
  const item = user as AdminUser & {
    displayName?: string;
    username?: string;
    name?: string;
  };

  return (
    item.displayName ??
    item.username ??
    item.name ??
    'Unknown User'
  );
}

function getUserEmail(
  user: AdminUser
): string {
  const item = user as AdminUser & {
    email?: string;
  };

  return item.email ?? '-';
}

function getUserFileCount(
  user: AdminUser
): number {
  const item = user as AdminUser & {
    files?: number;
    fileCount?: number;
    _count?: {
      files?: number;
    };
  };

  return (
    item.fileCount ??
    item.files ??
    item._count?.files ??
    0
  );
}

// แปลง byte เป็น B/KB/MB/GB อ่านง่าย — เดิมมี getUserStorage() ที่มองหา field ชื่อ "storage" ซึ่งไม่มี
// อยู่จริงใน response (field จริงคือ storageUsedBytes ตัวเลข byte ตรงๆ — ดู AdminUser ใน types/index.ts
// และ src/app/api/admin/user/route.ts ฝั่งเว็บ) เลยได้ "-" ตลอดไม่ว่า user จะมีไฟล์แค่ไหนก็ตาม
function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

function getUserInitial(
  user: AdminUser
): string {
  const name = getUserDisplayName(user);

  return name.charAt(0).toUpperCase();
}

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  errorText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 18,
  },

  retryButton: {
    minWidth: 120,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },

  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adminIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  /*
   * STATISTICS
   */

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#4F46E5',
  },

  statLabel: {
    marginTop: 5,
    fontSize: 13,
    color: '#64748B',
  },

  /*
   * SECTION
   */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  sectionCount: {
    fontSize: 12,
    color: '#64748B',
  },

  /*
   * SELECTED USER
   */

  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 22,
  },

  profileCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  profileText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },

  userInfo: {
    marginBottom: 14,
  },

  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    width: 70,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },

  tagsDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    minHeight: 30,
  },
  tagsDetailChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChipSmall: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagChipSmallText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4F46E5',
  },

  deleteButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  deleteText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },

  /*
   * USER LIST
   */

  userListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedUserCard: {
    borderColor: '#6366F1',
    borderWidth: 2,
    backgroundColor: '#FAFAFF',
  },

  smallAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallAvatarText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 15,
  },

  userListInfo: {
    flex: 1,
    marginLeft: 12,
  },

  userListName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  userListEmail: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  arrow: {
    fontSize: 25,
    color: '#94A3B8',
    marginLeft: 8,
  },

  /*
   * FILE LIST
   */

  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fileIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },

  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },

  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  fileMeta: {
    marginTop: 5,
    fontSize: 11,
    color: '#64748B',
  },

  /*
   * EMPTY
   */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});