import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { useShiftStore } from '../hooks/useShiftStore';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Launch'>;

const { width } = Dimensions.get('window');
const ROW_COUNT = 20;
const SCROLL_DISTANCE = 800;
const SINGLE_UNIT = 'ClockIn   ';
const FULL_TEXT = SINGLE_UNIT.repeat(20);

function ScrollingRow({ index }: { index: number }) {
  const goLeft = index % 2 === 0;
  const translateX = useSharedValue(goLeft ? 0 : -SCROLL_DISTANCE);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(goLeft ? -SCROLL_DISTANCE : 0, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.textRow, animStyle]}>
      <Text style={styles.bgText}>{FULL_TEXT}</Text>
    </Animated.View>
  );
}

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
      <View style={styles.bgContainer}>
        <View style={styles.rotatedContainer}>
          {Array.from({ length: ROW_COUNT }).map((_, i) => (
            <ScrollingRow key={i} index={i} />
          ))}
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
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
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedContainer: {
    transform: [{ rotate: '-15deg' }],
    width: width * 4,
    alignItems: 'flex-start',
  },
  textRow: {
    marginVertical: 2,
  },
  bgText: {
    fontFamily: Fonts.bold,
    fontSize: 72,
    color: Colors.bgText,
    letterSpacing: 2,
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
