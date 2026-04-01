import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BreakRecord } from './useShiftStore';
import { getDateKey, getWeekRange } from '../utils/dateUtils';

const HISTORY_KEY = '@clockin_history';

export interface ManualLog {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  duration: number;
  task: string;
}

export interface ShiftSession {
  clockInTime: number;
  /** Null while a shift is still active (UI merge only); archived sessions always have a number. */
  clockOutTime: number | null;
  breaks: BreakRecord[];
}

export interface DayRecord {
  date: string;
  shifts: ShiftSession[];
  manualLogs: ManualLog[];
}

type HistoryMap = Record<string, DayRecord>;

const EMPTY_DAY = (date: string): DayRecord => ({
  date,
  shifts: [],
  manualLogs: [],
});

function migrateLegacy(raw: Record<string, any>): HistoryMap {
  const result: HistoryMap = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val.shifts) {
      result[key] = val as DayRecord;
    } else {
      const shifts: ShiftSession[] = [];
      if (val.clockInTime && val.clockOutTime) {
        shifts.push({
          clockInTime: val.clockInTime,
          clockOutTime: val.clockOutTime,
          breaks: val.breaks || [],
        });
      }
      result[key] = {
        date: val.date || key,
        shifts,
        manualLogs: val.manualLogs || [],
      };
    }
  }
  return result;
}

interface HistoryStore {
  isLoading: boolean;
  history: HistoryMap;
  archiveShift: (clockInTime: number, clockOutTime: number, breaks: BreakRecord[]) => Promise<void>;
  addManualLog: (log: ManualLog) => Promise<void>;
  deleteManualLog: (dateKey: string, logId: string) => Promise<void>;
  getDayRecord: (dateKey: string) => DayRecord;
  getWeekRecords: () => DayRecord[];
  getWeeklyTotalMs: () => number;
  getTodayWorkedMs: () => number;
  refresh: () => Promise<void>;
}

const HistoryContext = createContext<HistoryStore | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const histRef = useRef(history);
  histRef.current = history;

  const load = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        const raw = JSON.parse(stored);
        const parsed = migrateLegacy(raw);
        setHistory(parsed);
        histRef.current = parsed;
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(parsed));
      } else {
        setHistory({});
        histRef.current = {};
      }
    } catch {
      // fall back to empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (next: HistoryMap) => {
    setHistory(next);
    histRef.current = next;
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, []);

  const archiveShift = useCallback(async (
    clockInTime: number,
    clockOutTime: number,
    breaks: BreakRecord[],
  ) => {
    const dateKey = getDateKey(clockInTime);
    const current = histRef.current;
    const existing = current[dateKey] || EMPTY_DAY(dateKey);
    const newSession: ShiftSession = { clockInTime, clockOutTime, breaks };
    const updated: HistoryMap = {
      ...current,
      [dateKey]: {
        ...existing,
        shifts: [...existing.shifts, newSession],
      },
    };
    await persist(updated);
  }, [persist]);

  const addManualLog = useCallback(async (log: ManualLog) => {
    const current = histRef.current;
    const existing = current[log.date] || EMPTY_DAY(log.date);
    const updated: HistoryMap = {
      ...current,
      [log.date]: {
        ...existing,
        manualLogs: [...existing.manualLogs, log],
      },
    };
    await persist(updated);
  }, [persist]);

  const deleteManualLog = useCallback(async (dateKey: string, logId: string) => {
    const current = histRef.current;
    const existing = current[dateKey];
    if (!existing) return;
    const updated: HistoryMap = {
      ...current,
      [dateKey]: {
        ...existing,
        manualLogs: existing.manualLogs.filter((l) => l.id !== logId),
      },
    };
    await persist(updated);
  }, [persist]);

  const getDayRecord = useCallback((dateKey: string): DayRecord => {
    return histRef.current[dateKey] || EMPTY_DAY(dateKey);
  }, []);

  const getWeekRecords = useCallback((): DayRecord[] => {
    const weekDays = getWeekRange();
    return weekDays.map((dk) => histRef.current[dk] || EMPTY_DAY(dk));
  }, []);

  const computeDayMs = useCallback((record: DayRecord): number => {
    let total = 0;
    for (const shift of record.shifts) {
      if (shift.clockOutTime == null) continue;
      let shiftMs = shift.clockOutTime - shift.clockInTime;
      const absentMs = shift.breaks
        .filter((b) => b.exceeded)
        .reduce((sum, b) => sum + b.duration, 0);
      shiftMs -= absentMs;
      total += Math.max(0, shiftMs);
    }
    for (const log of record.manualLogs) {
      total += log.duration;
    }
    return total;
  }, []);

  const getWeeklyTotalMs = useCallback((): number => {
    const records = getWeekRecords();
    return records.reduce((sum, r) => sum + computeDayMs(r), 0);
  }, [getWeekRecords, computeDayMs]);

  const getTodayWorkedMs = useCallback((): number => {
    const todayKey = getDateKey(Date.now());
    const record = histRef.current[todayKey] || EMPTY_DAY(todayKey);
    return computeDayMs(record);
  }, [computeDayMs]);

  return (
    <HistoryContext.Provider
      value={{
        isLoading,
        history,
        archiveShift,
        addManualLog,
        deleteManualLog,
        getDayRecord,
        getWeekRecords,
        getWeeklyTotalMs,
        getTodayWorkedMs,
        refresh: load,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryStore(): HistoryStore {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistoryStore must be used within HistoryProvider');
  return ctx;
}
