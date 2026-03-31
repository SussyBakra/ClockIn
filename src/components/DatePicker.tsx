import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { formatDateLong, getDateKey } from '../utils/dateUtils';

interface Props {
  value: string;
  onChange: (dateKey: string) => void;
  label?: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export default function DatePicker({ value, onChange, label }: Props) {
  const [visible, setVisible] = useState(false);
  const initial = new Date(value + 'T12:00:00');
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());

  const open = () => {
    const d = new Date(value + 'T12:00:00');
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setDay(d.getDate());
    setVisible(true);
  };

  const confirm = () => {
    const maxDay = daysInMonth(year, month);
    const safeDay = Math.min(day, maxDay);
    const m = String(month + 1).padStart(2, '0');
    const dd = String(safeDay).padStart(2, '0');
    onChange(`${year}-${m}-${dd}`);
    setVisible(false);
  };

  const totalDays = daysInMonth(year, month);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable style={styles.input} onPress={open}>
        <Text style={styles.calendarIcon}>📅</Text>
        <Text style={styles.inputText}>{formatDateLong(value)}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>Select Date</Text>

            <View style={styles.monthRow}>
              <Pressable onPress={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }}>
                <Text style={styles.arrow}>‹</Text>
              </Pressable>
              <Text style={styles.monthText}>{MONTH_NAMES[month]} {year}</Text>
              <Pressable onPress={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }}>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.daysScroll} contentContainerStyle={styles.daysGrid}>
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <Pressable
                  key={d}
                  style={[styles.dayCell, d === day && styles.daySelected]}
                  onPress={() => setDay(d)}
                >
                  <Text style={[styles.dayText, d === day && styles.dayTextSelected]}>{d}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.cancelBtn} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={confirm}>
                <Text style={styles.confirmText}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.normalTitle,
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  inputText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '90%',
    maxWidth: 360,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.normalTitle,
    marginBottom: 16,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrow: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.normalTitle,
    paddingHorizontal: 12,
  },
  monthText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
  },
  daysScroll: {
    maxHeight: 220,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  daySelected: {
    backgroundColor: Colors.primaryButton,
  },
  dayText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.normalTitle,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.workingBadgeText,
  },
  confirmBtn: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  confirmText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primaryButtonText,
  },
});
