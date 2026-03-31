import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import { useHistoryStore, ManualLog } from '../hooks/useHistoryStore';
import { useShiftStore } from '../hooks/useShiftStore';
import { getTodayKey, formatHoursMinutes } from '../utils/dateUtils';
import { formatTimeOfDay } from '../utils/timeUtils';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';

function parseHM(h: string, m: string): number {
  return (parseInt(h, 10) || 0) * 3600000 + (parseInt(m, 10) || 0) * 60000;
}

function msToHM(ms: number): { h: string; m: string } {
  const totalMin = Math.floor(ms / 60000);
  return { h: String(Math.floor(totalMin / 60)), m: String(totalMin % 60) };
}

export default function LogTimeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const historyStore = useHistoryStore();
  const shiftStore = useShiftStore();

  const todayStart = new Date();
  todayStart.setHours(9, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(17, 0, 0, 0);

  const [date, setDate] = useState(getTodayKey());
  const [startTime, setStartTime] = useState(todayStart.getTime());
  const [endTime, setEndTime] = useState(todayEnd.getTime());
  const [task, setTask] = useState('');

  const [targetH, setTargetH] = useState('8');
  const [targetM, setTargetM] = useState('0');
  const [workedH, setWorkedH] = useState('');
  const [workedM, setWorkedM] = useState('');
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

  const hasWorkedOverride = workedH !== '' || workedM !== '';
  const workedMs = hasWorkedOverride
    ? parseHM(workedH || '0', workedM || '0')
    : totalTodayMs;

  const targetMs = parseHM(targetH || '8', targetM || '0');
  const remainingMs = Math.max(0, targetMs - workedMs);
  const departureTime = currentTime + remainingMs;

  const autoWorked = msToHM(totalTodayMs);

  const clearForm = () => {
    const s = new Date();
    s.setHours(9, 0, 0, 0);
    const e = new Date();
    e.setHours(17, 0, 0, 0);
    setDate(getTodayKey());
    setStartTime(s.getTime());
    setEndTime(e.getTime());
    setTask('');
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
      task: task.trim() || 'General',
    };
    await historyStore.addManualLog(log);
    Alert.alert('Saved', `Logged ${formatHoursMinutes(duration)} for ${log.task}.`);
    clearForm();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={18} color={Colors.normalTitle} />
          </Pressable>
          <Text style={styles.headerTitle}>Log Time</Text>
        </View>
        <Ionicons name="time-outline" size={22} color={Colors.headerIcon} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <DatePicker label="Date" value={date} onChange={setDate} />

          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <TimePicker label="Start Time" value={startTime} onChange={setStartTime} />
            </View>
            <View style={styles.timeCol}>
              <TimePicker label="End Time" value={endTime} onChange={setEndTime} />
            </View>
          </View>

          <View style={styles.taskSection}>
            <Text style={styles.fieldLabel}>Task</Text>
            <TextInput
              style={styles.taskInput}
              value={task}
              onChangeText={setTask}
              placeholder="What did you work on?"
              placeholderTextColor={Colors.timeRange}
            />
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Log</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={clearForm}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.calcCard}>
          <View style={styles.calcTitleRow}>
            <View style={styles.calcBadge}>
              <Text style={styles.calcBadgeText}>Shift Calculator</Text>
            </View>
          </View>

          <Text style={styles.calcLabel}>Target Hours for Today</Text>
          <View style={styles.hmRow}>
            <TextInput
              style={styles.hmInput}
              value={targetH}
              onChangeText={setTargetH}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={styles.hmUnit}>hrs</Text>
            <Text style={styles.hmSep}>:</Text>
            <TextInput
              style={styles.hmInput}
              value={targetM}
              onChangeText={setTargetM}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="0"
              placeholderTextColor={Colors.timeRange}
              selectTextOnFocus
            />
            <Text style={styles.hmUnit}>mins</Text>
          </View>

          <Text style={styles.calcLabel}>Hours Already Worked</Text>
          <View style={styles.hmRow}>
            <TextInput
              style={styles.hmInput}
              value={hasWorkedOverride ? workedH : autoWorked.h}
              onChangeText={setWorkedH}
              keyboardType="number-pad"
              maxLength={2}
              placeholder={autoWorked.h}
              placeholderTextColor={Colors.timeRange}
              selectTextOnFocus
            />
            <Text style={styles.hmUnit}>hrs</Text>
            <Text style={styles.hmSep}>:</Text>
            <TextInput
              style={styles.hmInput}
              value={hasWorkedOverride ? workedM : autoWorked.m}
              onChangeText={setWorkedM}
              keyboardType="number-pad"
              maxLength={2}
              placeholder={autoWorked.m}
              placeholderTextColor={Colors.timeRange}
              selectTextOnFocus
            />
            <Text style={styles.hmUnit}>mins</Text>
          </View>

          <Text style={styles.calcLabel}>Current Time</Text>
          <View style={styles.calcTimeDisplay}>
            <Text style={styles.calcTimeText}>{formatTimeOfDay(currentTime)}</Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>
              To complete {formatHoursMinutes(targetMs)}, clock out at:
            </Text>
            <Text style={styles.resultValue}>{formatTimeOfDay(departureTime)}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Remaining time needed:</Text>
            <Text style={styles.resultValue}>{formatHoursMinutes(remainingMs)}</Text>
          </View>

          <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.resultLabel}>If you leave now, today&apos;s total:</Text>
            <Text style={styles.resultValue}>{formatHoursMinutes(workedMs)}</Text>
          </View>
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  formCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCol: {
    flex: 1,
  },
  taskSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.normalTitle,
    marginBottom: 8,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
    backgroundColor: Colors.white,
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
  calcCard: {
    backgroundColor: Colors.cardBgZinc,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  calcTitleRow: {
    marginBottom: 16,
  },
  calcBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.workingBadgeBg,
    borderWidth: 1,
    borderColor: Colors.workingBadgeBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  calcBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.base,
    color: Colors.workingBadgeText,
  },
  calcLabel: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: Colors.statLabel,
    marginBottom: 6,
    marginTop: 12,
  },
  hmRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hmInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    width: 52,
    height: 40,
    textAlign: 'center',
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: Colors.normalTitle,
    backgroundColor: Colors.white,
  },
  hmUnit: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.statLabel,
    marginLeft: 4,
    marginRight: 4,
  },
  hmSep: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.normalTitle,
    marginHorizontal: 6,
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
});
