import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FixedHeader from '../components/FixedHeader';
import { useApp } from '../context/AppContext';
import {
  formatDate,
  getTodayEntries,
  getDurationMs,
  formatDurationHM,
  formatDurationHMS,
  formatTimeOfDay,
  getWeeklyTotalMs,
} from '../utils/timeUtils';

export default function HomeScreen() {
  const { state, clockIn, clockOut, getActiveEntry } = useApp();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(Date.now());

  const activeEntry = getActiveEntry();
  const isClockedIn = !!activeEntry;

  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const todayEntries = getTodayEntries(state.entries);
  const todayTotalMs = todayEntries.reduce((s, e) => s + getDurationMs(e), 0);
  const weeklyTotalMs = getWeeklyTotalMs(state.entries, new Date());
  const weeklyGoalMs = state.settings.weeklyGoalHours * 3600000;
  const weeklyHours = Math.floor(weeklyTotalMs / 3600000);
  const estimatedEarned = ((weeklyTotalMs / 3600000) * state.settings.hourlyRate).toFixed(2);

  const sortedToday = [...todayEntries].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const handleToggle = useCallback(() => {
    if (isClockedIn) {
      clockOut();
    } else {
      clockIn();
    }
  }, [isClockedIn, clockIn, clockOut]);

  const headerHeight = insets.top + 60;

  const renderTimelineItem = ({ item, index }: { item: typeof sortedToday[0]; index: number }) => {
    const dur = getDurationMs(item);
    const isActive = item.isActive;
    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineDotCol}>
          <View style={[styles.timelineDot, isActive && styles.timelineDotActive]} />
          {index < sortedToday.length - 1 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineTitle}>
            {isActive ? 'Current Session' : item.project || 'Session'}
          </Text>
          <Text style={styles.timelineTime}>
            {formatTimeOfDay(item.startTime)} — {item.endTime ? formatTimeOfDay(item.endTime) : 'Present'}
          </Text>
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>{formatDurationHM(dur)}</Text>
        </View>
      </View>
    );
  };

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
        {/* Main Clock Card */}
        <View style={styles.clockCard}>
          <View style={[styles.statusPill, isClockedIn ? styles.statusPillActive : styles.statusPillInactive]}>
            <View style={[styles.statusDot, isClockedIn ? styles.statusDotActive : styles.statusDotInactive]} />
            <Text style={[styles.statusText, isClockedIn ? styles.statusTextActive : styles.statusTextInactive]}>
              {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
            </Text>
          </View>

          <Text style={styles.clockLabel}>Total Hours Today</Text>
          <Text style={styles.clockBig}>{formatDurationHM(todayTotalMs)}</Text>
          <Text style={styles.clockSmall}>{formatDurationHMS(todayTotalMs)}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.clockButton,
              isClockedIn ? styles.clockButtonOut : styles.clockButtonIn,
              pressed && styles.clockButtonPressed,
            ]}
            onPress={handleToggle}
          >
            <Ionicons
              name={isClockedIn ? 'stop-circle' : 'play-circle'}
              size={20}
              color={isClockedIn ? '#0D1B2A' : '#FFFFFF'}
            />
            <Text style={[styles.clockButtonText, isClockedIn ? styles.clockButtonTextOut : styles.clockButtonTextIn]}>
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          </Pressable>
        </View>

        {/* Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <Pressable style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        {sortedToday.length > 0 ? (
          <View style={styles.activityCard}>
            {sortedToday.map((item, index) => (
              <View key={item.id}>
                {renderTimelineItem({ item, index })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.activityCard}>
            <Text style={styles.emptyText}>No activity logged today. Clock in to start tracking!</Text>
          </View>
        )}

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
                  { width: `${Math.min(100, (weeklyTotalMs / weeklyGoalMs) * 100)}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconRow}>
              <Ionicons name="cash" size={18} color="#2ECC71" />
              <Text style={styles.statLabel}>Est. Earned</Text>
            </View>
            <Text style={styles.statValue}>${estimatedEarned}</Text>
          </View>
        </View>
      </ScrollView>
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
  clockCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusPillActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  statusPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#2ECC71',
  },
  statusDotInactive: {
    backgroundColor: '#6B7B8D',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusTextActive: {
    color: '#2ECC71',
  },
  statusTextInactive: {
    color: '#6B7B8D',
  },
  clockLabel: {
    fontSize: 14,
    color: '#8899AA',
    marginBottom: 8,
  },
  clockBig: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  clockSmall: {
    fontSize: 16,
    color: '#6B7B8D',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
    marginBottom: 24,
  },
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
    minHeight: 54,
  },
  clockButtonIn: {
    backgroundColor: '#6C63FF',
  },
  clockButtonOut: {
    backgroundColor: '#FFFFFF',
  },
  clockButtonPressed: {
    opacity: 0.85,
  },
  clockButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  clockButtonTextIn: {
    color: '#FFFFFF',
  },
  clockButtonTextOut: {
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
    fontWeight: '700',
    color: '#1A1A2E',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 48,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
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
    backgroundColor: '#CED4DA',
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: '#2ECC71',
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
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
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
    fontWeight: '600',
    color: '#4A5568',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7B8D',
    textAlign: 'center',
    paddingVertical: 12,
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
    color: '#6B7B8D',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
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
