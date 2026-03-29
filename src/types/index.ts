export interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  project: string;
  isActive: boolean;
}

export interface BreakEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  exceeded: boolean;
}

export interface DayLog {
  id: string;
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  breaks: BreakEntry[];
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
  dayLog: DayLog | null;
  isClockedIn: boolean;
  isOnBreak: boolean;
  breakStartTimestamp: number | null;
}

export type AppAction =
  | { type: 'HYDRATE'; payload: { entries: TimeEntry[]; settings: Settings; dayLog: DayLog | null; isClockedIn: boolean; isOnBreak: boolean; breakStartTimestamp: number | null } }
  | { type: 'CLOCK_IN'; payload: TimeEntry }
  | { type: 'CLOCK_OUT'; payload: { id: string; endTime: string } }
  | { type: 'ADD_ENTRY'; payload: TimeEntry }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'CLOCK_IN_SESSION'; payload: { dayLog: DayLog } }
  | { type: 'CLOCK_OUT_SESSION'; payload: { clockOutTime: string } }
  | { type: 'START_BREAK'; payload: { breakEntry: BreakEntry; timestamp: number } }
  | { type: 'END_BREAK'; payload: { breakId: string; endTime: string; exceeded: boolean } };
