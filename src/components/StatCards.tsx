import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { formatTimeOfDay, addHoursMs } from '../utils/timeUtils';
import { BreakRecord } from '../hooks/useShiftStore';

interface Props {
  clockInTime: number | null;
  breaks: BreakRecord[];
}

export default function StatCards({ clockInTime, breaks }: Props) {
  const absentMs = breaks
    .filter((b) => b.exceeded)
    .reduce((sum, b) => sum + b.duration, 0);

  const signOutTime = clockInTime
    ? formatTimeOfDay(addHoursMs(clockInTime, 5) + absentMs)
    : '--:-- --';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>WEEKLY GOAL</Text>
        <View style={styles.valueRow}>
          <Text style={styles.value}>32h</Text>
          <Text style={styles.secondary}>{' / 40h'}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>SIGN OUT TIME</Text>
        <Text style={styles.value}>{signOutTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    height: 75,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.statLabel,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['2xl'],
    color: Colors.statValue,
  },
  secondary: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.statSecondary,
  },
});
