import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';

type TimerState = 'working' | 'break' | 'exceeded';

interface Props {
  timerState: TimerState;
  timerDisplay: string;
  onPress: () => void;
  disabled: boolean;
}

function getBadgeConfig(state: TimerState) {
  switch (state) {
    case 'working':
      return {
        bg: Colors.workingBadgeBg,
        border: Colors.workingBadgeBorder,
        text: Colors.workingBadgeText,
        dot: Colors.workingDot,
        label: 'Working',
      };
    case 'break':
      return {
        bg: Colors.breakBadgeBg,
        border: Colors.breakBadgeBorder,
        text: Colors.breakBadgeText,
        dot: Colors.breakDot,
        label: 'Break',
      };
    case 'exceeded':
      return {
        bg: Colors.exceededBadgeBg,
        border: Colors.exceededBadgeBorder,
        text: Colors.exceededBadgeText,
        dot: Colors.exceededBadgeText,
        label: 'Break Time Exceeded',
      };
  }
}

export default function BreakTimerCard({
  timerState,
  timerDisplay,
  onPress,
  disabled,
}: Props) {
  const badge = getBadgeConfig(timerState);
  const buttonLabel = timerState === 'working' ? 'Start Break' : 'End Break';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.badge,
          { backgroundColor: badge.bg, borderColor: badge.border },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: badge.dot }]} />
        <Text style={[styles.badgeText, { color: badge.text }]}>
          {badge.label}
        </Text>
      </View>

      <Text style={styles.timer}>{timerDisplay}</Text>

      <Pressable
        style={[styles.button, disabled && { opacity: 0.4 }]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.timerCardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    letterSpacing: -0.26,
  },
  timer: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.timer,
    color: Colors.timerText,
    marginVertical: 16,
  },
  button: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    height: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.startBreakText,
  },
});
