import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { useShiftStore } from '../hooks/useShiftStore';
import type { RootStackParamList } from '../types/navigation';
import BrutalistTextMassBackground from '../components/BrutalistTextMassBackground';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Launch'>;

export default function LaunchScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { isClockedIn, isLoading, clockIn } = useShiftStore();

  const handleClockIn = async () => {
    await clockIn();
    navigation.replace('Main');
  };

  const handleSkip = () => {
    navigation.replace('Main');
  };

  if (isLoading) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <BrutalistTextMassBackground />

      <View style={[styles.content, { paddingBottom: insets.bottom + 24, zIndex: 1 }]}>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.clockInBtn, isClockedIn && { opacity: 0.4 }]}
            onPress={handleClockIn}
            disabled={isClockedIn}
          >
            <Text style={styles.clockInText}>Clock In</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBgLaunch,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 56,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  clockInBtn: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    height: 56,
    width: 280,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockInText: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.primaryButtonText,
  },
  skipBtn: {
    paddingVertical: 16,
  },
  skipText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.skipText,
  },
});
