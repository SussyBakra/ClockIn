/**
 * HR payroll-style duration math (pure functions, ms-based).
 */

export type SessionLike = {
  clockInTime: number;
  clockOutTime: number | null;
};

/** Excel-style end minus start; invalid ranges clamp to 0. */
export function calculateSessionDuration(signIn: number, signOut: number): number {
  if (signOut <= signIn) return 0;
  return signOut - signIn;
}

/** Sum gross session lengths for completed sessions only. */
export function calculateDailyTotal(sessions: SessionLike[]): number {
  let total = 0;
  for (const s of sessions) {
    if (s.clockOutTime == null) continue;
    total += calculateSessionDuration(s.clockInTime, s.clockOutTime);
  }
  return total;
}

/**
 * Expected working time for Mon–Fri week: (5 - leave - holiday - absent) * dailyTarget.
 * All counts are whole days in the current week.
 */
export function calculateExpectedWeeklyTime(
  dailyTargetHrs: number,
  leaveCount: number,
  holidayCount: number,
  absentCount = 0,
): number {
  const days = Math.max(0, 5 - leaveCount - holidayCount - absentCount);
  return days * dailyTargetHrs * 3600000;
}

/** Positive = overtime, negative = shortfall (actual − expected). */
export function calculateDifference(actualMs: number, expectedMs: number): number {
  return actualMs - expectedMs;
}
