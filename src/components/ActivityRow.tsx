import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { formatTimeOfDay, formatDuration } from '../utils/timeUtils';

export type RowType = 'clockIn' | 'break' | 'absent' | 'clockOut';

interface Props {
  type: RowType;
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isLast?: boolean;
}

export default function ActivityRow({
  type,
  label,
  startTime,
  endTime,
  duration,
  isLast,
}: Props) {
  const titleColor =
    type === 'absent' ? Colors.absentTitle : Colors.normalTitle;

  const timeText = endTime
    ? `${formatTimeOfDay(startTime)} - ${formatTimeOfDay(endTime)}`
    : formatTimeOfDay(startTime);

  const showBadge = (type === 'break' || type === 'absent') && duration != null;

  const badgeColors =
    type === 'absent'
      ? {
          bg: Colors.exceededBadgeBg,
          border: Colors.exceededBadgeBorder,
          text: Colors.exceededBadgeText,
        }
      : {
          bg: Colors.durationBadgeBg,
          border: Colors.durationBadgeBorder,
          text: Colors.durationBadgeText,
        };

  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: titleColor }]}>{label}</Text>
        <Text style={styles.time}>{timeText}</Text>
      </View>
      {showBadge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColors.bg, borderColor: badgeColors.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: badgeColors.text }]}>
            {formatDuration(duration!)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.md,
    marginBottom: 4,
  },
  time: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.timeRange,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
});
