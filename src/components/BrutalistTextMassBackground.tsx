import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const WORD = 'ClockIn';
const FONT_SIZE = 88;
/** Slightly below fontSize so vertical rows have no gap (text-mass). */
const LINE_HEIGHT = FONT_SIZE * 0.92;
const TEXT_COLOR = '#D4D4D8';
const FONT_FAMILY = 'Inter_900Black';
const SCROLL_DURATION_MS = 9000;

/** One horizontal period: same word repeated with zero separators. */
function buildMass(minChars: number) {
  const n = Math.ceil(minChars / WORD.length);
  return WORD.repeat(n);
}

interface MassRowProps {
  index: number;
  tileWidth: number;
  mass: string;
}

function MassRow({ index, tileWidth, mass }: MassRowProps) {
  const scrollRight = index % 2 === 0;
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tileWidth <= 0) return;
    translateX.value = scrollRight ? 0 : -tileWidth;
    translateX.value = withRepeat(
      withTiming(scrollRight ? tileWidth : 0, {
        duration: SCROLL_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [tileWidth, scrollRight]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const textStyle = [
    styles.massText,
    { width: tileWidth > 0 ? tileWidth : undefined },
  ];

  return (
    <View style={[styles.rowClip, { height: LINE_HEIGHT }]}>
      <Animated.View
        style={[
          styles.rowInner,
          { width: tileWidth > 0 ? tileWidth * 2 : '200%' },
          animStyle,
        ]}
      >
        <Text style={textStyle} numberOfLines={1} ellipsizeMode="clip">
          {mass}
        </Text>
        <Text style={textStyle} numberOfLines={1} ellipsizeMode="clip">
          {mass}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function BrutalistTextMassBackground() {
  const { height, width: winW } = useWindowDimensions();
  const { width: dimW, height: dimH } = Dimensions.get('window');
  const bgW = Math.max(winW, dimW);
  const bgH = Math.max(height, dimH);
  const [tileWidth, setTileWidth] = useState(0);
  const mass = buildMass(120);

  const rowCount = Math.max(12, Math.ceil(bgH / LINE_HEIGHT) + 4);

  return (
    <View
      style={[styles.root, { width: bgW, height: bgH }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={styles.measureOnly}
        pointerEvents="none"
        collapsable={false}
      >
        <Text
          style={styles.massText}
          numberOfLines={1}
          ellipsizeMode="clip"
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && Math.abs(w - tileWidth) > 1) setTileWidth(w);
          }}
        >
          {mass}
        </Text>
      </View>

      {tileWidth > 0 &&
        Array.from({ length: rowCount }).map((_, i) => (
          <MassRow key={i} index={i} tileWidth={tileWidth} mass={mass} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  measureOnly: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    flexDirection: 'row',
    pointerEvents: 'none',
  },
  rowClip: {
    width: '100%',
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  massText: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: TEXT_COLOR,
    letterSpacing: 0,
    paddingVertical: 0,
    margin: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
});
