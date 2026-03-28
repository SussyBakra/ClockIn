import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeEntry, Settings } from '../types';

const ENTRIES_KEY = '@clockin_entries';
const SETTINGS_KEY = '@clockin_settings';

export const DEFAULT_SETTINGS: Settings = {
  weeklyGoalHours: 40,
  hourlyRate: 25,
  name: 'User',
  email: 'user@email.com',
  notifications: true,
  darkMode: false,
};

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
  } catch {
    // silent fail
  }
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
  } catch {
    // silent fail
  }
}
