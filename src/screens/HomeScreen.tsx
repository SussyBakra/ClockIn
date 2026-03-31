import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { formatDate, formatTimer } from '../utils/timeUtils';
import { useShiftStore } from '../hooks/useShiftStore';
import { useTimer } from '../hooks/useTimer';
import BreakTimerCard from '../components/BreakTimerCard';
import ActivityList from '../components/ActivityList';
import StatCards from '../components/StatCards';
import SideHandle from '../components/SideHandle';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const BREAK_LIMIT = 600000;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const store = useShiftStore();
  const elapsed = useTimer(store.currentBreak?.startTime ?? null);

  const timerState: 'working' | 'break' | 'exceeded' = !store.currentBreak
    ? 'working'
    : elapsed >= BREAK_LIMIT
      ? 'exceeded'
      : 'break';

  const timerDisplay =
    timerState === 'working'
      ? '10:00'
      : timerState === 'break'
        ? formatTimer(BREAK_LIMIT - elapsed)
        : formatTimer(elapsed);

  const handleTimerPress = () => {
    if (timerState === 'working') {
      store.startBreak();
    } else {
      store.endBreak();
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.todayLabel}>TODAY</Text>
            <Text style={styles.dateText}>{formatDate(Date.now())}</Text>
          </View>
          <View style={styles.avatar} />
        </View>

        <BreakTimerCard
          timerState={timerState}
          timerDisplay={timerDisplay}
          onPress={handleTimerPress}
          disabled={!store.isClockedIn}
        />

        <View style={styles.activitySection}>
          <ActivityList
            clockInTime={store.clockInTime}
            clockOutTime={store.clockOutTime}
            breaks={store.breaks}
          />
        </View>

        <Pressable
          style={[styles.clockOutBtn, !store.isClockedIn && { opacity: 0.4 }]}
          onPress={() => store.clockOut()}
          disabled={!store.isClockedIn}
        >
          <Text style={styles.clockOutText}>Clock Out</Text>
        </Pressable>

        <View style={styles.statsSection}>
          <StatCards
            clockInTime={store.clockInTime}
            breaks={store.breaks}
          />
        </View>
      </ScrollView>

      <SideHandle onPress={() => navigation.navigate('Launch')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBgHome,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  todayLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    color: Colors.headerToday,
    letterSpacing: -0.26,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['3xl'],
    color: Colors.headerDate,
    letterSpacing: -0.34,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.border,
  },
  activitySection: {
    marginTop: 24,
  },
  clockOutBtn: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  clockOutText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.primaryButtonText,
  },
  statsSection: {
    marginTop: 40,
  },
});
