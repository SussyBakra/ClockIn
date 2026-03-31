import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import ActivityRow from './ActivityRow';
import EditActivityModal, { EditRowData } from './EditActivityModal';
import { useShiftStore, BreakRecord } from '../hooks/useShiftStore';
import { buildActivityRows } from '../utils/buildActivityRows';

interface Props {
  clockInTime: number | null;
  clockOutTime: number | null;
  breaks: BreakRecord[];
}

export default function ActivityList({
  clockInTime,
  clockOutTime,
  breaks,
}: Props) {
  const store = useShiftStore();
  const [selectedRow, setSelectedRow] = useState<EditRowData | null>(null);

  if (!clockInTime) return null;

  const rows = buildActivityRows(clockInTime, clockOutTime, breaks);

  const handleRowPress = (row: typeof rows[0]) => {
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
