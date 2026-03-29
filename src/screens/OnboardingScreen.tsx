import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface OnboardingScreenProps {
  onClockIn: () => void;
  onSkip: () => void;
}

export default function OnboardingScreen({ onClockIn, onSkip }: OnboardingScreenProps) {
  const { state, clockInSession } = useApp();
  const insets = useSafeAreaInsets();
  const alreadyClockedIn = state.isClockedIn;

  const handleClockIn = () => {
    if (alreadyClockedIn) return;
    clockInSession();
    onClockIn();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name="time" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>ClockIn</Text>
        <Text style={styles.subtitle}>Track your hours, own your time</Text>

        <Pressable
          style={({ pressed }) => [
            styles.clockInButton,
            alreadyClockedIn && styles.clockInButtonDisabled,
            pressed && !alreadyClockedIn && styles.buttonPressed,
          ]}
          onPress={handleClockIn}
          disabled={alreadyClockedIn}
        >
          <Ionicons name="play-circle" size={22} color={alreadyClockedIn ? '#6B7B8D' : '#FFFFFF'} />
          <Text style={[styles.clockInText, alreadyClockedIn && styles.clockInTextDisabled]}>
            {alreadyClockedIn ? 'Already Clocked In' : 'Clock In'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.skipButton, pressed && styles.buttonPressed]}
        onPress={onSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
    marginBottom: 48,
  },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1B2A',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    gap: 10,
    minHeight: 58,
    width: '100%',
  },
  clockInButtonDisabled: {
    backgroundColor: '#CED4DA',
    opacity: 0.6,
  },
  clockInText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  clockInTextDisabled: {
    color: '#6B7B8D',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
    minHeight: 48,
  },
  skipText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#6B7B8D',
  },
});
