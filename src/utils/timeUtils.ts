import { TimeEntry } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function getDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDurationMs(entry: TimeEntry): number {
  const start = new Date(entry.startTime).getTime();
  const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now();
  return Math.max(0, end - start);
}

export function formatDurationHM(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

export function formatDurationHMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDurationMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatCountdown(remainingMs: number): string {
  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function calculateSignOutTime(
  clockInTimeISO: string,
  totalAbsentMs: number,
  dailyQuotaHours: number = 5
): string {
  const clockIn = new Date(clockInTimeISO).getTime();
  const signOut = new Date(clockIn + dailyQuotaHours * 3600000 + totalAbsentMs);
  let hours = signOut.getHours();
  const minutes = String(signOut.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function formatTimeOfDay(isoString: string): string {
  const d = new Date(isoString);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function getTodayEntries(entries: TimeEntry[]): TimeEntry[] {
  const today = getDateString(new Date());
  return entries.filter((e) => e.date === today);
}

export function getTotalDurationForDay(entries: TimeEntry[], dateStr: string): number {
  return entries
    .filter((e) => e.date === dateStr)
    .reduce((sum, e) => sum + getDurationMs(e), 0);
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function getWeekEntries(entries: TimeEntry[], date: Date): TimeEntry[] {
  const { start, end } = getWeekBounds(date);
  return entries.filter((e) => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= start && d <= end;
  });
}

export function getWeeklyTotalMs(entries: TimeEntry[], date: Date): number {
  return getWeekEntries(entries, date).reduce((sum, e) => sum + getDurationMs(e), 0);
}

export function getWeekDays(date: Date): { dateStr: string; dayLabel: string; dayInitial: string; fullDate: string }[] {
  const { start } = getWeekBounds(date);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    result.push({
      dateStr: getDateString(d),
      dayLabel: days[i],
      dayInitial: days[i][0],
      fullDate: formatDate(d),
    });
  }
  return result;
}
