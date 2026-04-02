const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getDateKey(timestamp: number): string {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayKey(): string {
  return getDateKey(Date.now());
}

export function isToday(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

export function getDayName(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00');
  return DAY_NAMES[d.getDay()];
}

export function getDayShort(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00');
  return DAY_SHORT[d.getDay()];
}

export function formatDateShort(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00');
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export function formatDateLong(dateKey: string): string {
  const d = new Date(dateKey + 'T12:00:00');
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function getWeekRange(): string[] {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(12, 0, 0, 0);

  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(getDateKey(d.getTime()));
  }
  return days;
}

export function formatHoursMinutes(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

/** e.g. "2 hrs 01 min" for UI bubbles */
export function formatHoursMinutesSpelled(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hrLabel = hours === 1 ? 'hr' : 'hrs';
  const minLabel = minutes === 1 ? 'min' : 'mins';
  return `${hours} ${hrLabel} ${String(minutes).padStart(2, '0')} ${minLabel}`;
}
