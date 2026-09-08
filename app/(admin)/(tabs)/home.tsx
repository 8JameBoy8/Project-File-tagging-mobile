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
import type { AdminUser, ModerationItem } from '@/types';

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

export default function AdminHomeScreen() {
  const { user } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [files, setFiles] = useState<ModerationItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

      const nextUsers = usersResponse.users ?? [];
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
          : 'ไม่สามารถโหลดข้อมูลได้'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      'Delete User',
      `ต้องการลบ ${getUserDisplayName(
        selectedUser
      )} หรือไม่?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
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
        'ไม่สามารถลบได้',
        'ไม่สามารถลบบัญชีของตัวเองได้'
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
        'สำเร็จ',
        'ลบ User เรียบร้อยแล้ว'
      );
    } catch (err) {
      console.error('Delete user error:', err);

      Alert.alert(
        'เกิดข้อผิดพลาด',
        err instanceof Error
          ? err.message
          : 'ไม่สามารถลบ User ได้'
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * CLICK FILE
   * ============================================================
   *
   * ไม่ต้องยิง API ใหม่
   *
   * moderation item มี uploader มาให้แล้ว
   * จึงเปลี่ยน selectedUserId จาก uploader.id ได้เลย
   */

  const handleFilePress = (
    file: ModerationItem
  ) => {
    const uploaderId =
      file.uploader?.id ?? file.uploadedBy;

    if (uploaderId) {
      setSelectedUserId(uploaderId);
    }
  };

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
            กำลังโหลดข้อมูล...
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
            โหลดข้อมูลไม่สำเร็จ
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryText}>
              ลองใหม่
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
              Admin Dashboard
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage users and files
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
              Users
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {files.length}
            </Text>

            <Text style={styles.statLabel}>
              Files
            </Text>
          </View>
        </View>

        {/* =====================================================
            SELECTED USER
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Selected User
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
                label="Email"
                value={getUserEmail(selectedUser)}
              />

              <DetailRow
                label="ID"
                value={selectedUser.id}
              />

              <DetailRow
                label="Area"
                value={getUserArea(selectedUser)}
              />

              <DetailRow
                label="Files"
                value={String(
                  getUserFileCount(selectedUser)
                )}
              />

              <DetailRow
                label="Storage"
                value={getUserStorage(selectedUser)}
              />
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
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              ยังไม่มี User
            </Text>
          </View>
        )}

        {/* =====================================================
            USER LIST
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Users
          </Text>

          <Text style={styles.sectionCount}>
            {users.length} users
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
              ไม่พบ User
            </Text>
          </View>
        )}

        {/* =====================================================
            ALL FILES
        ===================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            All Files
          </Text>

          <Text style={styles.sectionCount}>
            {files.length} files
          </Text>
        </View>

        {files.length > 0 ? (
          files.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileCard}
              onPress={() =>
                handleFilePress(file)
              }
              activeOpacity={0.75}
            >
              <View style={styles.fileIcon}>
                <Text
                  style={styles.fileIconText}
                >
                  {getFileType(file)}
                </Text>
              </View>

              <View style={styles.fileInfo}>
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                >
                  {getFileName(file)}
                </Text>

                <Text
                  style={styles.fileMeta}
                  numberOfLines={2}
                >
                  {getUploaderName(file)}
                  {' • '}
                  {getFileSize(file)}
                  {' • '}
                  {getTagCount(file)} tags
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              ไม่พบไฟล์
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

function getUserArea(
  user: AdminUser
): string {
  const item = user as AdminUser & {
    area?: string;
  };

  return item.area ?? '-';
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

function getUserStorage(
  user: AdminUser
): string {
  const item = user as AdminUser & {
    storage?: string | number;
  };

  if (
    item.storage === undefined ||
    item.storage === null
  ) {
    return '-';
  }

  return String(item.storage);
}

function getUserInitial(
  user: AdminUser
): string {
  const name = getUserDisplayName(user);

  return name.charAt(0).toUpperCase();
}

function getFileName(
  file: ModerationItem
): string {
  const item = file as ModerationItem & {
    name?: string;
    filename?: string;
    originalName?: string;
  };

  return (
    item.name ??
    item.filename ??
    item.originalName ??
    'Unnamed file'
  );
}

function getFileType(
  file: ModerationItem
): string {
  const item = file as ModerationItem & {
    type?: string;
    mimeType?: string;
    fileType?: string;
  };

  const type =
    item.type ??
    item.fileType ??
    item.mimeType ??
    'FILE';

  if (type.includes('/')) {
    return (
      type
        .split('/')
        .pop()
        ?.toUpperCase() ?? 'FILE'
    );
  }

  return type.toUpperCase();
}

function getFileSize(
  file: ModerationItem
): string {
  const item = file as ModerationItem & {
    size?: string | number;
    fileSize?: string | number;
  };

  if (
    item.size !== undefined &&
    item.size !== null
  ) {
    return String(item.size);
  }

  if (
    item.fileSize !== undefined &&
    item.fileSize !== null
  ) {
    return String(item.fileSize);
  }

  return '-';
}

function getTagCount(
  file: ModerationItem
): number {
  const item = file as ModerationItem & {
    tags?: number | unknown[];
    tagIds?: string;
  };

  if (typeof item.tags === 'number') {
    return item.tags;
  }

  if (Array.isArray(item.tags)) {
    return item.tags.length;
  }

  if (item.tagIds) {
    try {
      const parsed = JSON.parse(
        item.tagIds
      );

      if (Array.isArray(parsed)) {
        return parsed.length;
      }
    } catch {
      return 0;
    }
  }

  return 0;
}

function getUploaderName(
  file: ModerationItem
): string {
  const item = file as ModerationItem & {
    uploader?: {
      id?: string;
      displayName?: string;
      email?: string;
    };
    uploadedBy?: string;
  };

  return (
    item.uploader?.displayName ??
    item.uploader?.email ??
    item.uploadedBy ??
    'Unknown User'
  );
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