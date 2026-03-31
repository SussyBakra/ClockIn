import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Background-safe elapsed timer.
 * Records the start timestamp and recalculates elapsed on every tick
 * and whenever the app returns to the foreground.
 */
export function useTimer(startTimestamp: number | null): number {
  const [elapsed, setElapsed] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!startTimestamp) {
      setElapsed(0);
      return;
    }

    const update = () => setElapsed(Date.now() - startTimestamp);
    update();

    const tick = () => {
      update();
      timeoutRef.current = setTimeout(tick, 1000);
    };
    timeoutRef.current = setTimeout(tick, 1000);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') update();
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      sub.remove();
    };
  }, [startTimestamp]);

  return elapsed;
}
