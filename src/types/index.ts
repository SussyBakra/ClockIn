export interface TimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime: string | null; // ISO string or null if active
  project: string;
  isActive: boolean;
}

export interface Settings {
  weeklyGoalHours: number;
  hourlyRate: number;
  name: string;
  email: string;
  notifications: boolean;
  darkMode: boolean;
}

export interface AppState {
  entries: TimeEntry[];
  settings: Settings;
  isLoaded: boolean;
}

export type AppAction =
  | { type: 'HYDRATE'; payload: { entries: TimeEntry[]; settings: Settings } }
  | { type: 'CLOCK_IN'; payload: TimeEntry }
  | { type: 'CLOCK_OUT'; payload: { id: string; endTime: string } }
  | { type: 'ADD_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> };
