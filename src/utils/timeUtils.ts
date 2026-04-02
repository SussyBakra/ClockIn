import { getDateKey } from './dateUtils';

export function formatTimer(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatTimeOfDay(timestamp: number): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')},${date.getFullYear()}`;
}

export function addHoursMs(timestamp: number, hours: number): number {
  return timestamp + hours * 60 * 60 * 1000;
}

/** Appends " (Next Day)" when the instant falls on a different calendar day than `contextDayKey` (YYYY-MM-DD). */
export function formatTimeOfDayWithNextDay(timestamp: number, contextDayKey: string): string {
  const base = formatTimeOfDay(timestamp);
  if (getDateKey(timestamp) !== contextDayKey) {
    return `${base} (Next Day)`;
  }
  return base;
}
