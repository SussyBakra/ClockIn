import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  onPress: () => void;
}

export default function SideHandle({ onPress }: Props) {
  return <Pressable style={styles.handle} onPress={onPress} hitSlop={16} />;
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -31,
    width: 6,
    height: 62,
    backgroundColor: Colors.sideHandle,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    zIndex: 10,
  },
});
