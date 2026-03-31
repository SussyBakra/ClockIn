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

export interface DayRecord {
  date: string;
  clockInTime: number | null;
  clockOutTime: number | null;
  breaks: BreakRecord[];
  manualLogs: ManualLog[];
}

type HistoryMap = Record<string, DayRecord>;

const EMPTY_DAY = (date: string): DayRecord => ({
  date,
  clockInTime: null,
  clockOutTime: null,
  breaks: [],
  manualLogs: [],
});

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
        const parsed = JSON.parse(stored) as HistoryMap;
        setHistory(parsed);
        histRef.current = parsed;
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
    const updated: HistoryMap = {
      ...current,
      [dateKey]: {
        ...existing,
        clockInTime,
        clockOutTime,
        breaks,
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
    if (record.clockInTime && record.clockOutTime) {
      let shiftMs = record.clockOutTime - record.clockInTime;
      const absentMs = record.breaks
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
