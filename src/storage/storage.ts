import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeEntry, Settings, DayLog } from '../types';

const ENTRIES_KEY = '@clockin_entries';
const SETTINGS_KEY = '@clockin_settings';
const DAYLOG_KEY = '@clockin_daylog';
const BREAK_STATE_KEY = '@clockin_break_state';

export const DEFAULT_SETTINGS: Settings = {
  weeklyGoalHours: 40,
  hourlyRate: 25,
  name: 'User',
  email: 'user@email.com',
  notifications: true,
  darkMode: false,
};

export interface PersistedBreakState {
  isClockedIn: boolean;
  isOnBreak: boolean;
  breakStartTimestamp: number | null;
}

export async function loadEntries(): Promise<TimeEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: TimeEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch {}
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export async function loadDayLog(): Promise<DayLog | null> {
  try {
    const raw = await AsyncStorage.getItem(DAYLOG_KEY);
    if (!raw) return null;
    const dayLog: DayLog = JSON.parse(raw);
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');
    if (dayLog.date !== todayStr) return null;
    return dayLog;
  } catch {
    return null;
  }
}

export async function saveDayLog(dayLog: DayLog | null): Promise<void> {
  try {
    if (dayLog) {
      await AsyncStorage.setItem(DAYLOG_KEY, JSON.stringify(dayLog));
    } else {
      await AsyncStorage.removeItem(DAYLOG_KEY);
    }
  } catch {}
}

export async function loadBreakState(): Promise<PersistedBreakState> {
  try {
    const raw = await AsyncStorage.getItem(BREAK_STATE_KEY);
    if (!raw) return { isClockedIn: false, isOnBreak: false, breakStartTimestamp: null };
    return JSON.parse(raw);
  } catch {
    return { isClockedIn: false, isOnBreak: false, breakStartTimestamp: null };
  }
}

export async function saveBreakState(state: PersistedBreakState): Promise<void> {
  try {
    await AsyncStorage.setItem(BREAK_STATE_KEY, JSON.stringify(state));
  } catch {}
}
