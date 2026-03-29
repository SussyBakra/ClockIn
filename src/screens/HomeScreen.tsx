import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  AppState as RNAppState,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FixedHeader from '../components/FixedHeader';
import SidePanel from '../components/SidePanel';
import { useApp } from '../context/AppContext';
import {
  formatDate,
  formatTimeOfDay,
  formatDurationMS,
  formatCountdown,
  calculateSignOutTime,
  getWeeklyTotalMs,
} from '../utils/timeUtils';

const BREAK_LIMIT_MS = 600000;

export default function HomeScreen() {
  const { state, startBreak, endBreak, clockOutSession } = useApp();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(Date.now());
  const [cardCenterY, setCardCenterY] = useState(250);

  const { dayLog, isClockedIn, isOnBreak, breakStartTimestamp } = state;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') setNow(Date.now());
    });
    return () => sub.remove();
  }, []);

  const elapsedBreakMs = isOnBreak && breakStartTimestamp ? now - breakStartTimestamp : 0;
  const breakExceeded = elapsedBreakMs >= BREAK_LIMIT_MS;
  const timerDisplay = !isOnBreak
    ? '10:00'
    : breakExceeded
    ? formatCountdown(elapsedBreakMs)
    : formatCountdown(BREAK_LIMIT_MS - elapsedBreakMs);

  const badgeLabel = !isOnBreak ? 'Working' : breakExceeded ? 'Break Time Exceeded' : 'Break';
  const badgeColor = !isOnBreak ? '#6B7B8D' : breakExceeded ? '#E74C3C' : '#2ECC71';
  const badgeBg = !isOnBreak
    ? 'rgba(107,123,141,0.12)'
    : breakExceeded
    ? 'rgba(231,76,60,0.12)'
    : 'rgba(46,204,113,0.15)';

  const totalAbsentMs = dayLog
    ? dayLog.breaks
        .filter((b) => b.exceeded && b.endTime)
        .reduce((sum, b) => sum + (new Date(b.endTime!).getTime() - new Date(b.startTime).getTime()), 0)
    : 0;

  const weeklyTotalMs = getWeeklyTotalMs(state.entries, new Date());
  const weeklyGoalMs = state.settings.weeklyGoalHours * 3600000;
  const weeklyHours = Math.floor(weeklyTotalMs / 3600000);

  const signOutTimeDisplay =
    isClockedIn && dayLog?.clockInTime
      ? calculateSignOutTime(dayLog.clockInTime, totalAbsentMs, 5)
      : '--:-- --';

  const headerHeight = insets.top + 60;

  const handleBreakToggle = useCallback(() => {
    if (isOnBreak) {
      endBreak();
    } else {
      startBreak();
    }
  }, [isOnBreak, startBreak, endBreak]);

  const handleCardLayout = (e: { nativeEvent: { layout: { y: number; height: number } } }) => {
    const { y, height } = e.nativeEvent.layout;
    setCardCenterY(headerHeight + y + height / 2);
  };

  const buildActivityRows = () => {
    if (!dayLog) return [];
    const rows: {
      key: string;
      heading: string;
      subtitle: string;
      badge: string | null;
      headingColor: string;
      dotColor: string;
    }[] = [];

    if (dayLog.clockInTime) {
      rows.push({
        key: 'clockin',
        heading: 'Clocked In',
        subtitle: formatTimeOfDay(dayLog.clockInTime),
        badge: null,
        headingColor: '#1A1A2E',
        dotColor: '#2ECC71',
      });
    }

    dayLog.breaks.forEach((b, idx) => {
      if (!b.endTime) return;
      const dur = new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
      if (b.exceeded) {
        rows.push({
          key: `absent-${b.id}`,
          heading: 'Absent',
          subtitle: `${formatTimeOfDay(b.startTime)} — ${formatTimeOfDay(b.endTime)}`,
          badge: formatDurationMS(dur),
          headingColor: '#E74C3C',
          dotColor: '#E74C3C',
        });
      } else {
        rows.push({
          key: `break-${b.id}`,
          heading: `Break-${idx + 1}`,
          subtitle: `${formatTimeOfDay(b.startTime)} — ${formatTimeOfDay(b.endTime)}`,
          badge: formatDurationMS(dur),
          headingColor: '#1A1A2E',
          dotColor: '#6B7B8D',
        });
      }
    });

    if (dayLog.clockOutTime) {
      rows.push({
        key: 'clockout',
        heading: 'Clock Out',
        subtitle: formatTimeOfDay(dayLog.clockOutTime),
        badge: null,
        headingColor: '#1A1A2E',
        dotColor: '#4A5568',
      });
    }

    return rows;
  };

  const activityRows = buildActivityRows();

  return (
    <View style={styles.screen}>
      <FixedHeader
        topLabel="TODAY"
        title={formatDate(new Date())}
        rightElement={
          <View style={styles.profileIcon}>
            <Ionicons name="person" size={18} color="#0D1B2A" />
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Break Timer Card */}
        <View style={styles.timerCard} onLayout={handleCardLayout}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>

          <Text style={styles.timerDisplay}>{timerDisplay}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.breakButton,
              isOnBreak ? styles.breakButtonEnd : styles.breakButtonStart,
              (!isClockedIn) && styles.breakButtonDisabled,
              pressed && isClockedIn && styles.buttonPressed,
            ]}
            onPress={handleBreakToggle}
            disabled={!isClockedIn}
          >
            <Ionicons
              name={isOnBreak ? 'stop-circle' : 'cafe'}
              size={20}
              color={isOnBreak ? '#0D1B2A' : '#FFFFFF'}
            />
            <Text style={[styles.breakButtonText, isOnBreak ? styles.breakTextEnd : styles.breakTextStart]}>
              {isOnBreak ? 'End Break' : 'Start Break'}
            </Text>
          </Pressable>
        </View>

        {/* Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
        </View>

        {activityRows.length > 0 ? (
          <View style={styles.activityCard}>
            {activityRows.map((row, index) => (
              <View key={row.key} style={styles.timelineItem}>
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, { backgroundColor: row.dotColor }]} />
                  {index < activityRows.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, { color: row.headingColor }]}>{row.heading}</Text>
                  <Text style={styles.timelineTime}>{row.subtitle}</Text>
                </View>
                {row.badge ? (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>{row.badge}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.activityCard}>
            <Text style={styles.emptyText}>
              {isClockedIn ? 'No breaks taken yet.' : 'Clock in to start tracking.'}
            </Text>
          </View>
        )}

        {/* Clock Out Button */}
        <Pressable
          style={({ pressed }) => [
            styles.clockOutButton,
            !isClockedIn && styles.clockOutDisabled,
            pressed && isClockedIn && styles.buttonPressed,
          ]}
          onPress={clockOutSession}
          disabled={!isClockedIn}
        >
          <Ionicons name="log-out-outline" size={20} color={isClockedIn ? '#FFFFFF' : '#6B7B8D'} />
          <Text style={[styles.clockOutText, !isClockedIn && styles.clockOutTextDisabled]}>
            Clock Out
          </Text>
        </Pressable>

        {/* Bottom Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="flame" size={18} color="#FF6B35" />
              <Text style={styles.statLabel}>Weekly Goal</Text>
            </View>
            <Text style={styles.statValue}>
              {weeklyHours}h / {state.settings.weeklyGoalHours}h
            </Text>
            <View style={styles.miniProgressBg}>
              <View
                style={[
                  styles.miniProgressFill,
                  { width: `${Math.min(100, weeklyGoalMs > 0 ? (weeklyTotalMs / weeklyGoalMs) * 100 : 0)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="time-outline" size={18} color="#6C63FF" />
              <Text style={styles.statLabel}>Sign Out Time</Text>
            </View>
            <Text style={styles.statValue}>{signOutTimeDisplay}</Text>
          </View>
        </View>
      </ScrollView>

      <SidePanel cardCenterY={cardCenterY} onClockIn={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8EDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerDisplay: {
    fontSize: 56,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginBottom: 24,
  },
  breakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
    minHeight: 54,
  },
  breakButtonStart: {
    backgroundColor: '#6C63FF',
  },
  breakButtonEnd: {
    backgroundColor: '#FFFFFF',
  },
  breakButtonDisabled: {
    backgroundColor: '#3A4A5C',
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  breakButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  breakTextStart: {
    color: '#FFFFFF',
  },
  breakTextEnd: {
    color: '#0D1B2A',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E8EDF2',
    marginTop: 4,
    minHeight: 24,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
  },
  durationBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 2,
  },
  durationBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#4A5568',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
    textAlign: 'center',
    paddingVertical: 12,
  },
  clockOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    borderRadius: 50,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 20,
    minHeight: 54,
  },
  clockOutDisabled: {
    backgroundColor: '#CED4DA',
    opacity: 0.5,
  },
  clockOutText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  clockOutTextDisabled: {
    color: '#6B7B8D',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#6B7B8D',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
  },
  miniProgressBg: {
    height: 6,
    backgroundColor: '#E8EDF2',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: 6,
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
});
