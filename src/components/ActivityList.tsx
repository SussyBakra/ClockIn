import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import ActivityRow, { RowType } from './ActivityRow';
import EditActivityModal, { EditRowData } from './EditActivityModal';
import { useShiftStore, BreakRecord } from '../hooks/useShiftStore';

interface Props {
  clockInTime: number | null;
  clockOutTime: number | null;
  breaks: BreakRecord[];
}

interface RowData {
  type: RowType;
  label: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  breakIndex?: number;
}

function buildRows(
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

export default function ActivityList({
  clockInTime,
  clockOutTime,
  breaks,
}: Props) {
  const store = useShiftStore();
  const [selectedRow, setSelectedRow] = useState<EditRowData | null>(null);

  if (!clockInTime) return null;

  const rows = buildRows(clockInTime, clockOutTime, breaks);

  const handleRowPress = (row: RowData) => {
    setSelectedRow({
      type: row.type,
      label: row.label,
      startTime: row.startTime,
      endTime: row.endTime,
      breakIndex: row.breakIndex,
    });
  };

  return (
    <View>
      <Text style={styles.sectionLabel}>Today&apos;s Activity</Text>
      <View style={styles.card}>
        {rows.map((row, i) => (
          <ActivityRow
            key={`${row.type}-${row.startTime}`}
            type={row.type}
            label={row.label}
            startTime={row.startTime}
            endTime={row.endTime}
            duration={row.duration}
            isLast={i === rows.length - 1}
            onPress={() => handleRowPress(row)}
          />
        ))}
      </View>

      <EditActivityModal
        visible={selectedRow != null}
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onSaveClockIn={(time) => store.updateClockInTime(time)}
        onSaveClockOut={(time) => store.updateClockOutTime(time)}
        onSaveBreak={(idx, start, end) => store.updateBreak(idx, start, end)}
        onDeleteBreak={(idx) => store.deleteBreak(idx)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.md,
    color: Colors.sectionLabel,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
