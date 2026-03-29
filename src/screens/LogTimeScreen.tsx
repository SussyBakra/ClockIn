import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import FixedHeader from '../components/FixedHeader';
import { useApp } from '../context/AppContext';
import { generateId, getDateString, formatDate, formatTimeOfDay } from '../utils/timeUtils';

type PickerMode = 'date' | 'startTime' | 'endTime' | null;

export default function LogTimeScreen() {
  const { dispatch } = useApp();
  const insets = useSafeAreaInsets();

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });
  const [project, setProject] = useState('');
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [saved, setSaved] = useState(false);

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerMode(null);
    if (selected) setDate(selected);
  };

  const handleStartChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerMode(null);
    if (selected) setStartTime(selected);
  };

  const handleEndChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerMode(null);
    if (selected) setEndTime(selected);
  };

  const handleSave = () => {
    const dateStr = getDateString(date);
    const start = new Date(date);
    start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    const end = new Date(date);
    end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    dispatch({
      type: 'ADD_ENTRY',
      payload: {
        id: generateId(),
        date: dateStr,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        project: project.trim() || 'General',
        isActive: false,
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setProject('');
  };

  const handleCancel = () => {
    setDate(new Date());
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    setStartTime(morning);
    const evening = new Date();
    evening.setHours(17, 0, 0, 0);
    setEndTime(evening);
    setProject('');
  };

  const headerHeight = insets.top + 60;

  return (
    <View style={styles.screen}>
      <FixedHeader
        title="Log Time"
        leftElement={
          <Ionicons name="time-outline" size={22} color="#6C63FF" />
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Manual Entry</Text>

          {/* Date Picker */}
          <Text style={styles.fieldLabel}>Date</Text>
          <Pressable
            style={styles.fieldButton}
            onPress={() => setPickerMode('date')}
          >
            <Ionicons name="calendar-outline" size={18} color="#6B7B8D" />
            <Text style={styles.fieldButtonText}>{formatDate(date)}</Text>
          </Pressable>

          {pickerMode === 'date' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Start / End Time */}
          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <Pressable
                style={styles.fieldButton}
                onPress={() => setPickerMode('startTime')}
              >
                <Ionicons name="time-outline" size={18} color="#6B7B8D" />
                <Text style={styles.fieldButtonText}>
                  {formatTimeOfDay(startTime.toISOString())}
                </Text>
              </Pressable>
            </View>
            <View style={styles.timeCol}>
              <Text style={styles.fieldLabel}>End Time</Text>
              <Pressable
                style={styles.fieldButton}
                onPress={() => setPickerMode('endTime')}
              >
                <Ionicons name="time-outline" size={18} color="#6B7B8D" />
                <Text style={styles.fieldButtonText}>
                  {formatTimeOfDay(endTime.toISOString())}
                </Text>
              </Pressable>
            </View>
          </View>

          {pickerMode === 'startTime' && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={handleStartChange}
            />
          )}

          {pickerMode === 'endTime' && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={handleEndChange}
            />
          )}

          {/* Project */}
          <Text style={styles.fieldLabel}>Project / Task</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Client Work, Meeting..."
            placeholderTextColor="#A0AEC0"
            value={project}
            onChangeText={setProject}
          />
        </View>

        {saved && (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.savedText}>Entry saved successfully!</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={handleSave}
        >
          <Text style={styles.primaryButtonText}>Save Log</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={handleCancel}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B7B8D',
    marginBottom: 8,
    marginTop: 4,
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
    minHeight: 48,
  },
  fieldButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A2E',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCol: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A2E',
    minHeight: 48,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  savedText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#2ECC71',
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 54,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    minHeight: 54,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#4A5568',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
