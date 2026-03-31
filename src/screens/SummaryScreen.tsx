import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Modal, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { useHistoryStore, DayRecord, ShiftSession } from '../hooks/useHistoryStore';
import { useShiftStore } from '../hooks/useShiftStore';
import {
  getWeekRange,
  getDayName,
  getDayShort,
  formatDateShort,
  isToday,
  formatHoursMinutes,
  getTodayKey,
} from '../utils/dateUtils';
import { buildActivityRows } from '../utils/buildActivityRows';
import { formatTimeOfDay } from '../utils/timeUtils';
import ActivityRow from '../components/ActivityRow';

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const historyStore = useHistoryStore();
  const shiftStore = useShiftStore();
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);
  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [weeklyTotalMs, setWeeklyTotalMs] = useState(0);

  const refreshData = useCallback(() => {
    const days = getWeekRange();
    setWeekDays(days);

    const recs = historyStore.getWeekRecords();
    setRecords(recs);
    setWeeklyTotalMs(historyStore.getWeeklyTotalMs());
  }, [historyStore]);

  useFocusEffect(refreshData);

  const weeklyGoalMs = 40 * 3600000;
  const progress = Math.min(1, weeklyTotalMs / weeklyGoalMs);

  const getDayWorkedMs = (record: DayRecord): number => {
    let total = 0;
    for (const shift of record.shifts) {
      let shiftMs = shift.clockOutTime - shift.clockInTime;
      const absentMs = shift.breaks
        .filter((b) => b.exceeded)
        .reduce((sum, b) => sum + b.duration, 0);
      shiftMs -= absentMs;
      total += Math.max(0, shiftMs);
    }
    for (const log of record.manualLogs) {
      total += log.duration;
    }

    if (isToday(record.date) && shiftStore.isClockedIn && shiftStore.clockInTime) {
      const liveMs = Date.now() - shiftStore.clockInTime;
      total += Math.max(0, liveMs);
    }

    return total;
  };

  const openDayDetail = (record: DayRecord) => {
    const todayKey = getTodayKey();
    if (record.date === todayKey && shiftStore.clockInTime) {
      const merged: DayRecord = { ...record, shifts: [...record.shifts], manualLogs: [...record.manualLogs] };
      if (shiftStore.isClockedIn || shiftStore.clockOutTime) {
        const liveShift: ShiftSession = {
          clockInTime: shiftStore.clockInTime,
          clockOutTime: shiftStore.clockOutTime || Date.now(),
          breaks: [...shiftStore.breaks],
        };
        const alreadyArchived = merged.shifts.some(
          (s) => s.clockInTime === liveShift.clockInTime
        );
        if (!alreadyArchived) {
          merged.shifts = [...merged.shifts, liveShift];
        }
      }
      setSelectedDay(merged);
    } else {
      setSelectedDay({ ...record, shifts: [...record.shifts], manualLogs: [...record.manualLogs] });
    }
  };

  const handleDeleteManualLog = (dateKey: string, logId: string) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await historyStore.deleteManualLog(dateKey, logId);
            refreshData();
            const updated = historyStore.getDayRecord(dateKey);
            if (updated.shifts.length > 0 || updated.manualLogs.length > 0) {
              setSelectedDay({ ...updated });
            } else {
              setSelectedDay(null);
            }
          },
        },
      ],
    );
  };

  const buildAllShiftRows = (shifts: ShiftSession[]) => {
    const allRows: ReturnType<typeof buildActivityRows> = [];
    shifts.forEach((shift, shiftIdx) => {
      const rows = buildActivityRows(shift.clockInTime, shift.clockOutTime, shift.breaks);
      if (shiftIdx > 0 && allRows.length > 0) {
        allRows[allRows.length - 1] = { ...allRows[allRows.length - 1] };
      }
      allRows.push(...rows);
    });
    return allRows;
  };

  const selectedRows = selectedDay ? buildAllShiftRows(selectedDay.shifts) : [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color={Colors.normalTitle} />
          </Pressable>
          <Text style={styles.headerTitle}>Weekly Summary</Text>
        </View>
        <Ionicons name="calendar-outline" size={22} color={Colors.headerIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>WEEKLY GOAL</Text>
          <View style={styles.goalValueRow}>
            <Text style={styles.goalValue}>{formatHoursMinutes(weeklyTotalMs)}</Text>
            <Text style={styles.goalSecondary}> / 40h</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Daily Breakdown</Text>

        {weekDays.map((dk, i) => {
          const record = records[i];
          if (!record) return null;
          const today = isToday(dk);
          const workedMs = getDayWorkedMs(record);
          const hasData = workedMs > 0;

          return (
            <Pressable
              key={dk}
              style={[styles.dayRow, today && styles.dayRowToday]}
              onPress={() => openDayDetail(record)}
            >
              <View style={[styles.dayAvatar, today && styles.dayAvatarToday]}>
                <Text style={[styles.dayAvatarText, today && styles.dayAvatarTextToday]}>
                  {getDayShort(dk)}
                </Text>
              </View>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{getDayName(dk)}</Text>
                <Text style={styles.dayDate}>{formatDateShort(dk)}</Text>
              </View>
              <Text style={[styles.dayHours, !hasData && styles.dayNoData]}>
                {hasData ? formatHoursMinutes(workedMs) : '-'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={selectedDay != null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedDay(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitleDay}>
                  {selectedDay ? getDayName(selectedDay.date) : ''}
                </Text>
                <Text style={styles.modalTitleDate}>
                  {selectedDay ? ` / ${formatDateShort(selectedDay.date)}` : ''}
                </Text>
              </View>
              <Pressable onPress={() => setSelectedDay(null)}>
                <Ionicons name="close" size={22} color={Colors.normalTitle} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {selectedRows.length > 0 ? (
                <View style={styles.activityCard}>
                  {selectedRows.map((row, idx) => (
                    <ActivityRow
                      key={`${row.type}-${row.startTime}-${idx}`}
                      type={row.type}
                      label={row.label}
                      startTime={row.startTime}
                      endTime={row.endTime}
                      duration={row.duration}
                      isLast={idx === selectedRows.length - 1 && (!selectedDay || selectedDay.manualLogs.length === 0)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No shift recorded for this day.</Text>
                </View>
              )}

              {selectedDay && selectedDay.manualLogs.length > 0 && (
                <View style={styles.manualSection}>
                  <Text style={styles.manualLabel}>Manual Logs</Text>
                  <View style={styles.activityCard}>
                    {selectedDay.manualLogs.map((log, idx) => (
                      <View
                        key={log.id}
                        style={[styles.manualRow, idx < selectedDay.manualLogs.length - 1 && styles.manualDivider]}
                      >
                        <View style={styles.manualInfo}>
                          <View style={styles.manualLeft}>
                            <Text style={styles.manualTask}>{log.task}</Text>
                            <Text style={styles.manualTimeRange}>
                              {formatTimeOfDay(log.startTime)} - {formatTimeOfDay(log.endTime)}
                            </Text>
                          </View>
                          <View style={styles.manualRight}>
                            <View style={styles.durationBadge}>
                              <Text style={styles.durationBadgeText}>
                                {formatHoursMinutes(log.duration)}
                              </Text>
                            </View>
                            <Pressable
                              style={styles.trashBtn}
                              onPress={() => handleDeleteManualLog(selectedDay.date, log.id)}
                              hitSlop={8}
                            >
                              <Ionicons name="trash-outline" size={16} color={Colors.exceededBadgeText} />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBgHome,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['3xl'],
    color: Colors.normalTitle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  goalCard: {
    backgroundColor: Colors.cardBgZinc,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
  },
  goalLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.statLabel,
    marginBottom: 8,
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  goalValue: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.normalTitle,
  },
  goalSecondary: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.statSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.progressBarBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.progressBarFill,
    borderRadius: 4,
  },
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.sectionLabel,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  dayRowToday: {
    backgroundColor: Colors.todayHighlight,
    borderColor: Colors.todayAccent,
    borderWidth: 1.5,
  },
  dayAvatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.cardBgZinc,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayAvatarToday: {
    backgroundColor: Colors.todayAccent,
    borderColor: Colors.todayAccent,
  },
  dayAvatarText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.normalTitle,
  },
  dayAvatarTextToday: {
    color: Colors.white,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    color: Colors.normalTitle,
    marginBottom: 2,
  },
  dayDate: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.timeRange,
  },
  dayHours: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    color: Colors.normalTitle,
  },
  dayNoData: {
    color: Colors.noData,
    fontSize: FontSizes.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '90%',
    maxWidth: 360,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
    marginRight: 8,
  },
  modalTitleDay: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['2xl'],
    color: Colors.normalTitle,
  },
  modalTitleDate: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    color: '#71717A',
  },
  modalScroll: {
    flexGrow: 0,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    color: Colors.noData,
  },
  manualSection: {
    marginTop: 16,
  },
  manualLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.sectionLabel,
    marginBottom: 8,
  },
  manualRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  manualDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  manualInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manualLeft: {
    flex: 1,
    marginRight: 8,
  },
  manualTask: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    color: Colors.normalTitle,
    marginBottom: 4,
  },
  manualTimeRange: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.timeRange,
  },
  manualRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationBadge: {
    backgroundColor: Colors.durationBadgeBg,
    borderWidth: 1,
    borderColor: Colors.durationBadgeBorder,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.durationBadgeText,
  },
  trashBtn: {
    padding: 4,
  },
});
