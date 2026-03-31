import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@clockin_shift';

export interface BreakRecord {
  startTime: number;
  endTime: number;
  duration: number;
  exceeded: boolean;
}

export interface ShiftData {
  clockInTime: number | null;
  clockOutTime: number | null;
  isClockedIn: boolean;
  currentBreak: { startTime: number } | null;
  breaks: BreakRecord[];
}

const DEFAULT_SHIFT: ShiftData = {
  clockInTime: null,
  clockOutTime: null,
  isClockedIn: false,
  currentBreak: null,
  breaks: [],
};

interface ShiftStore extends ShiftData {
  isLoading: boolean;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  resetShift: () => Promise<void>;
}

const ShiftContext = createContext<ShiftStore | null>(null);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ShiftData>(DEFAULT_SHIFT);
  const [isLoading, setIsLoading] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setData(JSON.parse(stored));
      } catch {
        // Storage read failed; fall back to defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: ShiftData) => {
    setData(next);
    dataRef.current = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clockIn = useCallback(async () => {
    await persist({
      ...DEFAULT_SHIFT,
      clockInTime: Date.now(),
      isClockedIn: true,
    });
  }, [persist]);

  const clockOut = useCallback(async () => {
    const d = dataRef.current;
    let breaks = d.breaks;

    if (d.currentBreak) {
      const now = Date.now();
      const dur = now - d.currentBreak.startTime;
      breaks = [
        ...breaks,
        {
          startTime: d.currentBreak.startTime,
          endTime: now,
          duration: dur,
          exceeded: dur > 600000,
        },
      ];
    }

    await persist({
      ...d,
      clockOutTime: Date.now(),
      isClockedIn: false,
      currentBreak: null,
      breaks,
    });
  }, [persist]);

  const startBreak = useCallback(async () => {
    const d = dataRef.current;
    await persist({ ...d, currentBreak: { startTime: Date.now() } });
  }, [persist]);

  const endBreak = useCallback(async () => {
    const d = dataRef.current;
    if (!d.currentBreak) return;
    const now = Date.now();
    const duration = now - d.currentBreak.startTime;
    const record: BreakRecord = {
      startTime: d.currentBreak.startTime,
      endTime: now,
      duration,
      exceeded: duration > 600000,
    };
    await persist({
      ...d,
      currentBreak: null,
      breaks: [...d.breaks, record],
    });
  }, [persist]);

  const resetShift = useCallback(async () => {
    await persist(DEFAULT_SHIFT);
  }, [persist]);

  return (
    <ShiftContext.Provider
      value={{
        ...data,
        isLoading,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        resetShift,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
}

export function useShiftStore(): ShiftStore {
  const ctx = useContext(ShiftContext);
  if (!ctx) throw new Error('useShiftStore must be used within ShiftProvider');
  return ctx;
}
