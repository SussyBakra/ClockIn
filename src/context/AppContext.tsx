import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, AppAction, TimeEntry, Settings } from '../types';
import {
  loadEntries,
  loadSettings,
  saveEntries,
  saveSettings,
  DEFAULT_SETTINGS,
} from '../storage/storage';

const initialState: AppState = {
  entries: [],
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        entries: action.payload.entries,
        settings: action.payload.settings,
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
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.payload.id),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
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
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  dispatch: () => {},
  clockIn: () => {},
  clockOut: () => {},
  getActiveEntry: () => undefined,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    (async () => {
      const [entries, settings] = await Promise.all([loadEntries(), loadSettings()]);
      dispatch({ type: 'HYDRATE', payload: { entries, settings } });
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

  const getActiveEntry = useCallback(
    () => state.entries.find((e) => e.isActive),
    [state.entries]
  );

  const clockIn = useCallback(
    (project: string = 'General') => {
      const now = new Date();
      const entry: TimeEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
        date:
          now.getFullYear() +
          '-' +
          String(now.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(now.getDate()).padStart(2, '0'),
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
      dispatch({
        type: 'CLOCK_OUT',
        payload: { id: active.id, endTime: new Date().toISOString() },
      });
    }
  }, [state.entries, dispatch]);

  return (
    <AppContext.Provider value={{ state, dispatch, clockIn, clockOut, getActiveEntry }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
