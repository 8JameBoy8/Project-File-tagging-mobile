// app/(admin)/(tabs)/approve.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { ModerationItem } from '@/types';

type ModerationResponse = {
  items: ModerationItem[];
};

export default function AdminApproveScreen() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedItem = useMemo(() => {
    return (
      items.find(
        (item) => String(item.id) === String(selectedId),
      ) ?? null
    );
  }, [items, selectedId]);

  /*
   * ==========================================================
   * LOAD MODERATION QUEUE
   * ==========================================================
   *
   * API:
   * GET /api/admin/moderation
   *
   * backend default status = PENDING_REVIEW
   */

  const loadModeration = useCallback(async () => {
    try {
      const response =
        await apiFetch<ModerationResponse>(
          '/api/admin/moderation',
        );

      const nextItems = response.items ?? [];

      setItems(nextItems);

      setSelectedId((currentSelectedId) => {
        const stillExists = nextItems.some(
          (item) =>
            String(item.id) ===
            String(currentSelectedId),
        );

        if (stillExists) {
          return currentSelectedId;
        }

        return nextItems[0]
          ? String(nextItems[0].id)
          : null;
      });
    } catch (error) {
      console.error(
        'Admin moderation load error:',
        error,
      );

      Alert.alert(
        'เกิดข้อผิดพลาด',
        error instanceof Error
          ? error.message
          : 'ไม่สามารถโหลดรายการรอตรวจสอบได้',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadModeration();
  }, [loadModeration]);

  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    loadModeration();
  };

  /*
   * ==========================================================
   * APPROVE
   * ==========================================================
   *
   * POST /api/admin/moderation/[id]/approve
   */

  const handleApprove = () => {
    if (!selectedItem || processing) {
      return;
    }

    Alert.alert(
      'Approve',
      `ต้องการอนุมัติไฟล์ "${getFileName(
        selectedItem,
      )}" หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setProcessing(true);

              await apiFetch(
                `/api/admin/moderation/${selectedItem.id}/approve`,
                {
                  method: 'POST',
                },
              );

              Alert.alert(
                'สำเร็จ',
                'อนุมัติไฟล์เรียบร้อยแล้ว',
              );

              await loadModeration();
            } catch (error) {
              console.error(
                'Approve error:',
                error,
              );

              Alert.alert(
                'Approve ไม่สำเร็จ',
                error instanceof Error
                  ? error.message
                  : 'ไม่สามารถอนุมัติไฟล์ได้',
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  /*
   * ==========================================================
   * REJECT
   * ==========================================================
   *
   * POST /api/admin/moderation/[id]/reject
   */

  const handleReject = () => {
    if (!selectedItem || processing) {
      return;
    }

    Alert.alert(
      'Reject',
      `ต้องการปฏิเสธไฟล์ "${getFileName(
        selectedItem,
      )}" หรือไม่?`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);

              await apiFetch(
                `/api/admin/moderation/${selectedItem.id}/reject`,
                {
                  method: 'POST',
                },
              );

              Alert.alert(
                'สำเร็จ',
                'ปฏิเสธไฟล์เรียบร้อยแล้ว',
              );

              await loadModeration();
            } catch (error) {
              console.error(
                'Reject error:',
                error,
              );

              Alert.alert(
                'Reject ไม่สำเร็จ',
                error instanceof Error
                  ? error.message
                  : 'ไม่สามารถปฏิเสธไฟล์ได้',
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
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
            กำลังโหลดไฟล์ที่รอตรวจสอบ...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ==========================================================
   * MAIN
   * ==========================================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Approve / Select
            </Text>

            <Text style={styles.headerSubtitle}>
              ตรวจสอบไฟล์ที่ต้องให้ Admin ตัดสิน
            </Text>
          </View>

          <View style={styles.pendingBadge}>
            <Text style={styles.pendingNumber}>
              {items.length}
            </Text>

            <Text style={styles.pendingLabel}>
              Pending
            </Text>
          </View>
        </View>

        {/* ====================================================
            SELECTED FILE
        ==================================================== */}

        {selectedItem ? (
          <View style={styles.detailCard}>
            <View style={styles.fileHero}>
              <View style={styles.fileIconLarge}>
                <Text
                  style={styles.fileIconLargeText}
                >
                  {getFileExtension(
                    selectedItem,
                  )}
                </Text>
              </View>

              <View
                style={styles.fileHeroText}
              >
                <Text
                  style={styles.fileTitle}
                  numberOfLines={2}
                >
                  {getFileName(
                    selectedItem,
                  )}
                </Text>

                <Text
                  style={styles.fileUploader}
                  numberOfLines={1}
                >
                  {getUploaderName(
                    selectedItem,
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* FILE DETAILS */}

            <DetailRow
              label="Username"
              value={getUploaderName(
                selectedItem,
              )}
            />

            <DetailRow
              label="Type"
              value={getFileType(
                selectedItem,
              )}
            />

            <DetailRow
              label="Size"
              value={getFileSize(
                selectedItem,
              )}
            />

            <DetailRow
              label="Tags"
              value={`${getTagCount(
                selectedItem,
              )} tags`}
            />

            <DetailRow
              label="Status"
              value={getStatus(
                selectedItem,
              )}
            />

            {/* =================================================
                SCAN RESULT
            ================================================= */}

            <View style={styles.scanCard}>
              <Text style={styles.scanTitle}>
                Scan Result / Reason
              </Text>

              <Text style={styles.scanText}>
                {getScanResult(
                  selectedItem,
                )}
              </Text>
            </View>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.approveButton,
                  processing &&
                    styles.disabledButton,
                ]}
                disabled={processing}
                onPress={handleApprove}
              >
                {processing ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.approveText
                    }
                  >
                    ✓  Approve
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rejectButton,
                  processing &&
                    styles.disabledButton,
                ]}
                disabled={processing}
                onPress={handleReject}
              >
                <Text
                  style={styles.rejectText}
                >
                  ×  Reject
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ✓
            </Text>

            <Text style={styles.emptyTitle}>
              ไม่มีไฟล์ที่รอตรวจสอบ
            </Text>

            <Text style={styles.emptyText}>
              ขณะนี้ไม่มีไฟล์
              PENDING_REVIEW
            </Text>
          </View>
        )}

        {/* ====================================================
            REVIEW QUEUE
        ==================================================== */}

        <View style={styles.queueHeader}>
          <View>
            <Text style={styles.queueTitle}>
              Review Queue
            </Text>

            <Text style={styles.queueSubtitle}>
              ไฟล์ที่รอการตรวจสอบ
            </Text>
          </View>
        </View>

        {items.length > 0 ? (
          items.map((item) => {
            const isSelected =
              String(item.id) ===
              String(selectedId);

            return (
              <TouchableOpacity
                key={String(item.id)}
                style={[
                  styles.queueCard,
                  isSelected &&
                    styles.queueCardSelected,
                ]}
                activeOpacity={0.75}
                onPress={() =>
                  setSelectedId(
                    String(item.id),
                  )
                }
              >
                <View
                  style={[
                    styles.queueIcon,
                    isSelected &&
                      styles.queueIconSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.queueIconText,
                      isSelected &&
                        styles.queueIconTextSelected,
                    ]}
                  >
                    {getFileExtension(
                      item,
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.queueContent
                  }
                >
                  <Text
                    style={
                      styles.queueFileName
                    }
                    numberOfLines={1}
                  >
                    {getFileName(item)}
                  </Text>

                  <Text
                    style={
                      styles.queueUploader
                    }
                    numberOfLines={1}
                  >
                    {getUploaderName(
                      item,
                    )}
                  </Text>

                  <Text
                    style={styles.queueMeta}
                  >
                    {getFileSize(item)}
                    {' • '}
                    {getTagCount(item)}
                    {' tags'}
                  </Text>
                </View>

                <View
                  style={
                    styles.queueRight
                  }
                >
                  {isSelected ? (
                    <View
                      style={
                        styles.selectedCircle
                      }
                    >
                      <Text
                        style={
                          styles.selectedCheck
                        }
                      >
                        ✓
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={
                        styles.queueArrow
                      }
                    >
                      ›
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyQueue}>
            <Text style={styles.emptyText}>
              ไม่มีรายการ
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==============================================================
   DETAIL ROW
   ============================================================== */

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
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

/* ==============================================================
   HELPERS
   ============================================================== */

function getFileName(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    name?: string | null;
    filename?: string | null;
    originalName?: string | null;
    fileName?: string | null;
  };

  return (
    file.fileName ??
    file.filename ??
    file.originalName ??
    file.name ??
    'Untitled file'
  );
}

function getUploaderName(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    uploader?: {
      id?: string;
      displayName?: string | null;
      email?: string | null;
    } | null;
    uploadedBy?: string | null;
  };

  return (
    file.uploader?.displayName ??
    file.uploader?.email ??
    file.uploadedBy ??
    'Unknown User'
  );
}

function getFileType(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    type?: string | null;
    mimeType?: string | null;
    fileType?: string | null;
  };

  const value =
    file.type ??
    file.fileType ??
    file.mimeType ??
    'FILE';

  if (value.includes('/')) {
    return (
      value
        .split('/')
        .pop()
        ?.toUpperCase() ?? 'FILE'
    );
  }

  return value.toUpperCase();
}

function getFileSize(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    size?: string | number | null;
    fileSize?: string | number | null;
  };

  if (
    file.size !== undefined &&
    file.size !== null
  ) {
    return String(file.size);
  }

  if (
    file.fileSize !== undefined &&
    file.fileSize !== null
  ) {
    return String(file.fileSize);
  }

  return '-';
}

function getTagCount(
  item: ModerationItem,
): number {
  const file = item as ModerationItem & {
    tags?: number | unknown[] | null;
    tagIds?: string | null;
  };

  if (typeof file.tags === 'number') {
    return file.tags;
  }

  if (Array.isArray(file.tags)) {
    return file.tags.length;
  }

  if (file.tagIds) {
    try {
      const parsed = JSON.parse(
        file.tagIds,
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

function getStatus(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    status?: string | null;
  };

  return (
    file.status ??
    'PENDING_REVIEW'
  );
}

function getScanResult(
  item: ModerationItem,
): string {
  const file = item as ModerationItem & {
    scanResult?: string | null;
  };

  if (!file.scanResult) {
    return 'ไม่มีข้อมูลผลการสแกน';
  }

  try {
    const parsed = JSON.parse(
      file.scanResult,
    );

    if (
      typeof parsed === 'string'
    ) {
      return parsed;
    }

    return (
      parsed.message ??
      parsed.reason ??
      parsed.result ??
      JSON.stringify(parsed)
    );
  } catch {
    return file.scanResult;
  }
}

function getFileExtension(
  item: ModerationItem,
): string {
  const name =
    getFileName(item).toLowerCase();

  if (name.endsWith('.pdf')) {
    return 'PDF';
  }

  if (
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  ) {
    return 'DOC';
  }

  if (
    name.endsWith('.ppt') ||
    name.endsWith('.pptx')
  ) {
    return 'PPT';
  }

  if (
    name.endsWith('.xls') ||
    name.endsWith('.xlsx')
  ) {
    return 'XLS';
  }

  if (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png')
  ) {
    return 'IMG';
  }

  return 'FILE';
}

/* ==============================================================
   STYLES
   ============================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  screen: {
    flex: 1,
  },

  container: {
    padding: 18,
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
    color: '#64748B',
    fontSize: 13,
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
  },

  pendingBadge: {
    minWidth: 55,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },

  pendingNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
  },

  pendingLabel: {
    marginTop: 1,
    fontSize: 9,
    color: '#6366F1',
  },

  /*
   * DETAIL
   */

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 22,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  fileHero: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  fileIconLarge: {
    width: 58,
    height: 58,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fileIconLargeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },

  fileHeroText: {
    flex: 1,
    marginLeft: 12,
  },

  fileTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  fileUploader: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },

  detailRow: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  detailLabel: {
    width: 75,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  detailValue: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
  },

  /*
   * SCAN
   */

  scanCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  scanTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
  },

  scanText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: '#7C2D12',
  },

  /*
   * ACTIONS
   */

  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },

  approveButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  rejectButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.55,
  },

  /*
   * QUEUE
   */

  queueHeader: {
    marginBottom: 10,
  },

  queueTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  queueSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  queueCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 11,
    marginBottom: 8,
  },

  queueCardSelected: {
    backgroundColor: '#F8F8FF',
    borderColor: '#818CF8',
  },

  queueIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  queueIconSelected: {
    backgroundColor: '#EEF2FF',
  },

  queueIconText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },

  queueIconTextSelected: {
    color: '#4F46E5',
  },

  queueContent: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },

  queueFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  queueUploader: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  queueMeta: {
    marginTop: 3,
    fontSize: 10,
    color: '#94A3B8',
  },

  queueRight: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  queueArrow: {
    fontSize: 25,
    color: '#94A3B8',
  },

  selectedCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCheck: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  /*
   * EMPTY
   */

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: 34,
    color: '#16A34A',
    fontWeight: '800',
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },

  emptyQueue: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 25,
    alignItems: 'center',
  },
});