import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, AppAction, TimeEntry, Settings, DayLog, BreakEntry } from '../types';
import {
  loadEntries,
  loadSettings,
  saveEntries,
  saveSettings,
  loadDayLog,
  saveDayLog,
  loadBreakState,
  saveBreakState,
  DEFAULT_SETTINGS,
} from '../storage/storage';
import { generateId, getDateString } from '../utils/timeUtils';

const initialState: AppState = {
  entries: [],
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  dayLog: null,
  isClockedIn: false,
  isOnBreak: false,
  breakStartTimestamp: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        entries: action.payload.entries,
        settings: action.payload.settings,
        dayLog: action.payload.dayLog,
        isClockedIn: action.payload.isClockedIn,
        isOnBreak: action.payload.isOnBreak,
        breakStartTimestamp: action.payload.breakStartTimestamp,
        isLoaded: true,
      };

    case 'CLOCK_IN':
      return { ...state, entries: [...state.entries, action.payload] };

    case 'CLOCK_OUT':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.payload.id
            ? { ...e, endTime: action.payload.endTime, isActive: false }
            : e
        ),
      };

    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.payload] };

    case 'DELETE_ENTRY':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.payload.id) };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'CLOCK_IN_SESSION':
      return {
        ...state,
        dayLog: action.payload.dayLog,
        isClockedIn: true,
        isOnBreak: false,
        breakStartTimestamp: null,
      };

    case 'CLOCK_OUT_SESSION': {
      const updatedDayLog = state.dayLog
        ? { ...state.dayLog, clockOutTime: action.payload.clockOutTime }
        : null;
      return {
        ...state,
        dayLog: updatedDayLog,
        isClockedIn: false,
        isOnBreak: false,
        breakStartTimestamp: null,
      };
    }

    case 'START_BREAK': {
      if (!state.dayLog) return state;
      return {
        ...state,
        dayLog: {
          ...state.dayLog,
          breaks: [...state.dayLog.breaks, action.payload.breakEntry],
        },
        isOnBreak: true,
        breakStartTimestamp: action.payload.timestamp,
      };
    }

    case 'END_BREAK': {
      if (!state.dayLog) return state;
      return {
        ...state,
        dayLog: {
          ...state.dayLog,
          breaks: state.dayLog.breaks.map((b) =>
            b.id === action.payload.breakId
              ? { ...b, endTime: action.payload.endTime, exceeded: action.payload.exceeded }
              : b
          ),
        },
        isOnBreak: false,
        breakStartTimestamp: null,
      };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  clockIn: (project?: string) => void;
  clockOut: () => void;
  getActiveEntry: () => TimeEntry | undefined;
  clockInSession: () => void;
  clockOutSession: () => void;
  startBreak: () => void;
  endBreak: () => void;
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
  clockIn: () => {},
  clockOut: () => {},
  getActiveEntry: () => undefined,
  clockInSession: () => {},
  clockOutSession: () => {},
  startBreak: () => {},
  endBreak: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      const [entries, settings, dayLog, breakState] = await Promise.all([
        loadEntries(),
        loadSettings(),
        loadDayLog(),
        loadBreakState(),
      ]);
      const isClockedIn = dayLog ? breakState.isClockedIn : false;
      const isOnBreak = dayLog ? breakState.isOnBreak : false;
      const breakStartTimestamp = dayLog ? breakState.breakStartTimestamp : null;
      dispatch({
        type: 'HYDRATE',
        payload: { entries, settings, dayLog, isClockedIn, isOnBreak, breakStartTimestamp },
      });
    })();
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    saveEntries(state.entries);
  }, [state.entries, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    saveSettings(state.settings);
  }, [state.settings, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    saveDayLog(state.dayLog);
  }, [state.dayLog, state.isLoaded]);

  useEffect(() => {
    if (!state.isLoaded) return;
    saveBreakState({
      isClockedIn: state.isClockedIn,
      isOnBreak: state.isOnBreak,
      breakStartTimestamp: state.breakStartTimestamp,
    });
  }, [state.isClockedIn, state.isOnBreak, state.breakStartTimestamp, state.isLoaded]);

  const getActiveEntry = useCallback(
    () => state.entries.find((e) => e.isActive),
    [state.entries]
  );

  const clockIn = useCallback(
    (project: string = 'General') => {
      const now = new Date();
      const entry: TimeEntry = {
        id: generateId(),
        date: getDateString(now),
        startTime: now.toISOString(),
        endTime: null,
        project,
        isActive: true,
      };
      dispatch({ type: 'CLOCK_IN', payload: entry });
    },
    [dispatch]
  );

  const clockOut = useCallback(() => {
    const active = state.entries.find((e) => e.isActive);
    if (active) {
      dispatch({ type: 'CLOCK_OUT', payload: { id: active.id, endTime: new Date().toISOString() } });
    }
  }, [state.entries, dispatch]);

  const clockInSession = useCallback(() => {
    if (state.isClockedIn) return;
    const now = new Date();
    const dayLog: DayLog = {
      id: generateId(),
      date: getDateString(now),
      clockInTime: now.toISOString(),
      clockOutTime: null,
      breaks: [],
    };
    dispatch({ type: 'CLOCK_IN_SESSION', payload: { dayLog } });

    const entry: TimeEntry = {
      id: generateId(),
      date: getDateString(now),
      startTime: now.toISOString(),
      endTime: null,
      project: 'Work Session',
      isActive: true,
    };
    dispatch({ type: 'CLOCK_IN', payload: entry });
  }, [state.isClockedIn, dispatch]);

  const clockOutSession = useCallback(() => {
    if (!state.isClockedIn) return;
    const now = new Date();
    dispatch({ type: 'CLOCK_OUT_SESSION', payload: { clockOutTime: now.toISOString() } });

    const active = state.entries.find((e) => e.isActive);
    if (active) {
      dispatch({ type: 'CLOCK_OUT', payload: { id: active.id, endTime: now.toISOString() } });
    }
  }, [state.isClockedIn, state.entries, dispatch]);

  const startBreak = useCallback(() => {
    if (!state.isClockedIn || state.isOnBreak) return;
    const now = Date.now();
    const breakEntry: BreakEntry = {
      id: generateId(),
      startTime: new Date(now).toISOString(),
      endTime: null,
      exceeded: false,
    };
    dispatch({ type: 'START_BREAK', payload: { breakEntry, timestamp: now } });
  }, [state.isClockedIn, state.isOnBreak, dispatch]);

  const endBreak = useCallback(() => {
    if (!state.isOnBreak || !state.dayLog || !state.breakStartTimestamp) return;
    const now = Date.now();
    const elapsed = now - state.breakStartTimestamp;
    const exceeded = elapsed >= 600000;
    const activeBreak = state.dayLog.breaks.find((b) => b.endTime === null);
    if (activeBreak) {
      dispatch({
        type: 'END_BREAK',
        payload: { breakId: activeBreak.id, endTime: new Date(now).toISOString(), exceeded },
      });
    }
  }, [state.isOnBreak, state.dayLog, state.breakStartTimestamp, dispatch]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        clockIn,
        clockOut,
        getActiveEntry,
        clockInSession,
        clockOutSession,
        startBreak,
        endBreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
