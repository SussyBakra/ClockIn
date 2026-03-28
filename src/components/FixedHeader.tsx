import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FixedHeaderProps {
  topLabel?: string;
  title: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export default function FixedHeader({ topLabel, title, rightElement, leftElement }: FixedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          {leftElement}
          <View>
            {topLabel ? <Text style={styles.topLabel}>{topLabel}</Text> : null}
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        {rightElement ? <View style={styles.rightSection}>{rightElement}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7B8D',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});
