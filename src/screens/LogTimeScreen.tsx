import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { useHistoryStore, ManualLog } from '../hooks/useHistoryStore';
import { useShiftStore } from '../hooks/useShiftStore';
import { getTodayKey, formatHoursMinutes } from '../utils/dateUtils';
import { formatTimeOfDay } from '../utils/timeUtils';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';

const TASKS = ['Development', 'Design', 'Meeting', 'Review', 'Other'];

export default function LogTimeScreen() {
  const insets = useSafeAreaInsets();
  const historyStore = useHistoryStore();
  const shiftStore = useShiftStore();

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(9, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(17, 0, 0, 0);

  const [date, setDate] = useState(getTodayKey());
  const [startTime, setStartTime] = useState(todayStart.getTime());
  const [endTime, setEndTime] = useState(todayEnd.getTime());
  const [task, setTask] = useState('Development');
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  const [targetHours, setTargetHours] = useState('8');
  const [workedOverride, setWorkedOverride] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const todayWorkedMs = historyStore.getTodayWorkedMs();
  const liveWorkedMs = shiftStore.clockInTime && !shiftStore.clockOutTime
    ? Date.now() - shiftStore.clockInTime
    : 0;
  const totalTodayMs = todayWorkedMs + liveWorkedMs;
  const workedHours = workedOverride !== ''
    ? parseFloat(workedOverride) || 0
    : totalTodayMs / 3600000;

  const target = parseFloat(targetHours) || 8;
  const remainingMs = Math.max(0, (target - workedHours) * 3600000);
  const departureTime = currentTime + remainingMs;
  const leaveNowTotal = workedHours * 3600000;

  const clearForm = () => {
    const s = new Date();
    s.setHours(9, 0, 0, 0);
    const e = new Date();
    e.setHours(17, 0, 0, 0);
    setDate(getTodayKey());
    setStartTime(s.getTime());
    setEndTime(e.getTime());
    setTask('Development');
  };

  const handleSave = async () => {
    if (endTime <= startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    const duration = endTime - startTime;
    const log: ManualLog = {
      id: `log_${Date.now()}`,
      date,
      startTime,
      endTime,
      duration,
      task,
    };
    await historyStore.addManualLog(log);
    Alert.alert('Saved', `Logged ${formatHoursMinutes(duration)} for ${task}.`);
    clearForm();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Time</Text>
        <Ionicons name="time-outline" size={22} color={Colors.headerIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <DatePicker label="Date" value={date} onChange={setDate} />

          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <TimePicker label="Start Time" value={startTime} onChange={setStartTime} />
            </View>
            <View style={styles.timeCol}>
              <TimePicker label="End Time" value={endTime} onChange={setEndTime} />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Task</Text>
          <Pressable style={styles.taskInput} onPress={() => setShowTaskPicker(!showTaskPicker)}>
            <Text style={styles.taskText}>{task}</Text>
            <Ionicons name="chevron-down" size={18} color={Colors.timeRange} />
          </Pressable>
          {showTaskPicker && (
            <View style={styles.taskDropdown}>
              {TASKS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.taskOption, t === task && styles.taskOptionActive]}
                  onPress={() => { setTask(t); setShowTaskPicker(false); }}
                >
                  <Text style={[styles.taskOptionText, t === task && styles.taskOptionTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.calcCard}>
          <Text style={styles.calcTitle}>Shift Calculator</Text>

          <Text style={styles.calcLabel}>Target Hours for Today</Text>
          <TextInput
            style={styles.calcInput}
            value={targetHours}
            onChangeText={setTargetHours}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />

          <Text style={styles.calcLabel}>Hours Already Worked</Text>
          <TextInput
            style={styles.calcInput}
            value={workedOverride !== '' ? workedOverride : workedHours.toFixed(2)}
            onChangeText={setWorkedOverride}
            keyboardType="decimal-pad"
            placeholder={workedHours.toFixed(2)}
            placeholderTextColor={Colors.timeRange}
            selectTextOnFocus
          />

          <Text style={styles.calcLabel}>Current Time</Text>
          <View style={styles.calcTimeDisplay}>
            <Text style={styles.calcTimeText}>{formatTimeOfDay(currentTime)}</Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              To complete {target}h, clock out at:
            </Text>
            <Text style={styles.resultValue}>{formatTimeOfDay(departureTime)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Remaining time needed:</Text>
            <Text style={styles.resultValue}>{formatHoursMinutes(remainingMs)}</Text>
          </View>

          <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.resultLabel}>If you leave now, today's total:</Text>
            <Text style={styles.resultValue}>{formatHoursMinutes(leaveNowTotal)}</Text>
          </View>
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Log</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={clearForm}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.screenBgHome,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes['3xl'],
    color: Colors.normalTitle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCol: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.normalTitle,
    marginBottom: 8,
  },
  taskInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
  },
  taskText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
  },
  taskDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  taskOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  taskOptionActive: {
    backgroundColor: Colors.cardBgZinc,
  },
  taskOptionText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.normalTitle,
  },
  taskOptionTextActive: {
    color: Colors.primaryButton,
  },
  calcCard: {
    backgroundColor: Colors.cardBgZinc,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  calcTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
    color: Colors.normalTitle,
    marginBottom: 16,
  },
  calcLabel: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.statLabel,
    marginBottom: 6,
    marginTop: 12,
  },
  calcInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
    backgroundColor: Colors.white,
  },
  calcTimeDisplay: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  calcTimeText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
  },
  calcDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  resultLabel: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.statValue,
    flex: 1,
    marginRight: 8,
  },
  resultValue: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.normalTitle,
  },
  saveBtn: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.primaryButtonText,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.normalTitle,
  },
});
