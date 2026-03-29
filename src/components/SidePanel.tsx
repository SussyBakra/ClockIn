import React from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.78;
const SNAP_THRESHOLD = PANEL_WIDTH * 0.35;

interface SidePanelProps {
  cardCenterY: number;
  onClockIn: () => void;
}

export default function SidePanel({ cardCenterY, onClockIn }: SidePanelProps) {
  const { state, clockInSession } = useApp();
  const translateX = useSharedValue(-PANEL_WIDTH);
  const isOpen = useSharedValue(false);

  const openPanel = () => {
    translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    isOpen.value = true;
  };

  const closePanel = () => {
    translateX.value = withTiming(-PANEL_WIDTH, { duration: 250, easing: Easing.out(Easing.cubic) });
    isOpen.value = false;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isOpen.value) {
        translateX.value = Math.min(0, Math.max(-PANEL_WIDTH, e.translationX));
      } else {
        translateX.value = Math.min(0, -PANEL_WIDTH + Math.max(0, e.translationX));
      }
    })
    .onEnd((e) => {
      if (isOpen.value) {
        if (e.translationX < -SNAP_THRESHOLD) {
          runOnJS(closePanel)();
        } else {
          runOnJS(openPanel)();
        }
      } else {
        if (e.translationX > SNAP_THRESHOLD) {
          runOnJS(openPanel)();
        } else {
          runOnJS(closePanel)();
        }
      }
    });

  const animatedPanel = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: (translateX.value + PANEL_WIDTH) / PANEL_WIDTH * 0.35,
    pointerEvents: translateX.value > -PANEL_WIDTH + 10 ? 'auto' as const : 'none' as const,
  }));

  const animatedHandle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + PANEL_WIDTH }],
  }));

  const handleClockIn = () => {
    if (state.isClockedIn) return;
    clockInSession();
    closePanel();
    onClockIn();
  };

  const handleTopOffset = Math.max(0, cardCenterY - 30);

  return (
    <>
      <Animated.View style={[styles.overlay, animatedOverlay]} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.handleWrap, animatedHandle, { top: handleTopOffset }]}>
          <Pressable onPress={openPanel} style={styles.handle}>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.panel, animatedPanel]}>
          <View style={styles.panelContent}>
            <View style={styles.panelCenter}>
              <View style={styles.iconCircle}>
                <Ionicons name="time" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.panelTitle}>Clock In</Text>
              <Text style={styles.panelSubtitle}>Start tracking your shift</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.clockInButton,
                  state.isClockedIn && styles.clockInDisabled,
                  pressed && !state.isClockedIn && styles.pressed,
                ]}
                onPress={handleClockIn}
                disabled={state.isClockedIn}
              >
                <Ionicons name="play-circle" size={20} color={state.isClockedIn ? '#6B7B8D' : '#FFFFFF'} />
                <Text style={[styles.clockInText, state.isClockedIn && styles.disabledText]}>
                  {state.isClockedIn ? 'Already Clocked In' : 'Clock In'}
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.skipBtn} onPress={closePanel}>
              <Text style={styles.skipText}>Close</Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 90,
  },
  handleWrap: {
    position: 'absolute',
    left: 0,
    zIndex: 100,
  },
  handle: {
    width: 28,
    height: 60,
    backgroundColor: '#0D1B2A',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#F8F9FA',
    zIndex: 95,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  panelContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  panelCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#6B7B8D',
    marginBottom: 36,
  },
  clockInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1B2A',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    minHeight: 54,
    width: '100%',
  },
  clockInDisabled: {
    backgroundColor: '#CED4DA',
    opacity: 0.6,
  },
  clockInText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#6B7B8D',
  },
  pressed: {
    opacity: 0.85,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  skipText: {
    fontSize: 14,
    color: '#6B7B8D',
    fontWeight: '500',
  },
});
