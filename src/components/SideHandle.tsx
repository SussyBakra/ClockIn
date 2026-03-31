import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  onPress: () => void;
}

export default function SideHandle({ onPress }: Props) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Pressable style={styles.handle} onPress={onPress} hitSlop={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 20,
  },
  handle: {
    width: 6,
    height: 62,
    backgroundColor: Colors.sideHandle,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});
