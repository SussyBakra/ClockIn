import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FixedHeader from '../components/FixedHeader';
import { useApp } from '../context/AppContext';
import {
  getWeeklyTotalMs,
  getWeekDays,
  getTotalDurationForDay,
  formatDurationHM,
} from '../utils/timeUtils';

const DAY_COLORS = ['#6C63FF', '#FF6B35', '#2ECC71', '#E91E63', '#00BCD4', '#FFC107', '#9C27B0'];

export default function SummaryScreen() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const weeklyTotalMs = getWeeklyTotalMs(state.entries, new Date());
  const weeklyGoalMs = state.settings.weeklyGoalHours * 3600000;
  const progress = weeklyGoalMs > 0 ? Math.min(1, weeklyTotalMs / weeklyGoalMs) : 0;
  const weekDays = getWeekDays(new Date());

  const headerHeight = insets.top + 60;

  const renderDayItem = ({ item, index }: { item: typeof weekDays[0]; index: number }) => {
    const dayMs = getTotalDurationForDay(state.entries, item.dateStr);
    const color = DAY_COLORS[index % DAY_COLORS.length];
    return (
      <View style={styles.dayRow}>
        <View style={[styles.dayCircle, { backgroundColor: color }]}>
          <Text style={styles.dayInitial}>{item.dayInitial}</Text>
        </View>
        <View style={styles.dayInfo}>
          <Text style={styles.dayLabel}>{item.dayLabel}</Text>
          <Text style={styles.dayDate}>{item.fullDate}</Text>
        </View>
        <Text style={styles.dayHours}>{formatDurationHM(dayMs)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FixedHeader
        topLabel="OVERVIEW"
        title="Weekly Summary"
        rightElement={
          <Ionicons name="calendar" size={22} color="#6C63FF" />
        }
      />

      <FlatList
        data={weekDays}
        keyExtractor={(item) => item.dateStr}
        renderItem={renderDayItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Progress Card */}
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>Weekly Goal Progress</Text>
              <Text style={styles.progressValue}>{formatDurationHM(weeklyTotalMs)}</Text>
              <Text style={styles.progressSub}>
                of {state.settings.weeklyGoalHours}h goal
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}% Complete</Text>
            </View>

            {/* Daily Breakdown Header */}
            <Text style={styles.breakdownTitle}>Daily Breakdown</Text>
            <View style={styles.breakdownCard}>
            {/* FlatList items render inside here visually due to ListHeaderComponent */}
            </View>
          </>
        }
        ListHeaderComponentStyle={styles.listHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  listHeader: {
    marginBottom: 0,
  },
  progressCard: {
    backgroundColor: '#0D1B2A',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#8899AA',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  progressSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
    marginBottom: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B7B8D',
  },
  breakdownTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  breakdownCard: {
    // acts as visual wrapper context for FlatList rows
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dayInitial: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#1A1A2E',
  },
  dayDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
    marginTop: 2,
  },
  dayHours: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
  },
  separator: {
    height: 10,
  },
});
