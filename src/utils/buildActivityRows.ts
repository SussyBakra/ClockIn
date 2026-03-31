import type { RowType } from '../components/ActivityRow';
import type { BreakRecord } from '../hooks/useShiftStore';

export interface RowData {
  type: RowType;
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  breakIndex?: number;
}

export function buildActivityRows(
  clockInTime: number,
  clockOutTime: number | null,
  breaks: BreakRecord[],
): RowData[] {
  const rows: RowData[] = [];

  rows.push({ type: 'clockIn', label: 'Clocked In', startTime: clockInTime });

  let breakCount = 0;
  breaks.forEach((b, idx) => {
    if (b.exceeded) {
      rows.push({
        type: 'absent',
        label: 'Absent',
        startTime: b.startTime,
        endTime: b.endTime,
        duration: b.duration,
        breakIndex: idx,
      });
    } else {
      breakCount++;
      rows.push({
        type: 'break',
        label: `Break-${breakCount}`,
        startTime: b.startTime,
        endTime: b.endTime,
        duration: b.duration,
        breakIndex: idx,
      });
    }
  });

  if (clockOutTime) {
    rows.push({
      type: 'clockOut',
      label: 'Clocked Out',
      startTime: clockOutTime,
    });
  }

  return rows;
}
