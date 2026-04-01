import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

interface Props {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
  /** Wider row: hour/minute inputs flex to fill width (e.g. Log Time form). */
  fullWidth?: boolean;
}

function decompose(ts: number) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { h, m, ampm, date: d };
}

function recompose(date: Date, h: number, m: number, ampm: 'AM' | 'PM'): number {
  let hours24 = h % 12;
  if (ampm === 'PM') hours24 += 12;
  const result = new Date(date);
  result.setHours(hours24, m, 0, 0);
  return result.getTime();
}

export default function TimePicker({ value, onChange, label, fullWidth }: Props) {
  const parts = decompose(value);
  const [hourStr, setHourStr] = useState(String(parts.h));
  const [minStr, setMinStr] = useState(String(parts.m).padStart(2, '0'));
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(parts.ampm);

  useEffect(() => {
    const p = decompose(value);
    setHourStr(String(p.h));
    setMinStr(String(p.m).padStart(2, '0'));
    setAmpm(p.ampm);
  }, [value]);

  const commit = (h: string, m: string, ap: 'AM' | 'PM') => {
    const hour = Math.min(12, Math.max(1, parseInt(h, 10) || 12));
    const min = Math.min(59, Math.max(0, parseInt(m, 10) || 0));
    onChange(recompose(parts.date, hour, min, ap));
  };

  const toggleAmPm = () => {
    const next = ampm === 'AM' ? 'PM' : 'AM';
    setAmpm(next);
    commit(hourStr, minStr, next);
  };

  return (
    <View style={[styles.container, fullWidth && styles.containerFull]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.row, fullWidth && styles.rowFull]}>
        <TextInput
          style={[styles.input, fullWidth && styles.inputFlex]}
          value={hourStr}
          onChangeText={setHourStr}
          onBlur={() => commit(hourStr, minStr, ampm)}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={[styles.input, fullWidth && styles.inputFlex]}
          value={minStr}
          onChangeText={setMinStr}
          onBlur={() => commit(hourStr, minStr, ampm)}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
        />
        <Pressable style={[styles.ampmBtn, fullWidth && styles.ampmBtnFull]} onPress={toggleAmPm}>
          <Text style={styles.ampmText}>{ampm}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  containerFull: {
    marginVertical: 0,
    width: '100%',
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.normalTitle,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowFull: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    width: 48,
    height: 40,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.normalTitle,
    backgroundColor: Colors.white,
  },
  inputFlex: {
    flex: 1,
    width: undefined,
    minWidth: 0,
  },
  colon: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.normalTitle,
    marginHorizontal: 8,
  },
  ampmBtn: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    minWidth: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.timerCardBg,
  },
  ampmBtnFull: {
    flexShrink: 0,
    marginLeft: 10,
  },
  ampmText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.normalTitle,
  },
});
