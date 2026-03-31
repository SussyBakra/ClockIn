import React, { useState } from 'react';
import { View, Text, Pressable, Modal, Alert, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import TimePicker from './TimePicker';
import type { RowType } from './ActivityRow';

export interface EditRowData {
  type: RowType;
  label: string;
  startTime: number;
  endTime?: number;
  breakIndex?: number;
}

interface Props {
  visible: boolean;
  row: EditRowData | null;
  onClose: () => void;
  onSaveClockIn: (time: number) => void;
  onSaveClockOut: (time: number) => void;
  onSaveBreak: (index: number, startTime: number, endTime: number) => void;
  onDeleteBreak: (index: number) => void;
}

export default function EditActivityModal({
  visible,
  row,
  onClose,
  onSaveClockIn,
  onSaveClockOut,
  onSaveBreak,
  onDeleteBreak,
}: Props) {
  if (!row) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <ModalContent
            row={row}
            onClose={onClose}
            onSaveClockIn={onSaveClockIn}
            onSaveClockOut={onSaveClockOut}
            onSaveBreak={onSaveBreak}
            onDeleteBreak={onDeleteBreak}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalContent({
  row,
  onClose,
  onSaveClockIn,
  onSaveClockOut,
  onSaveBreak,
  onDeleteBreak,
}: Omit<Props, 'visible'> & { row: EditRowData }) {
  const [startTime, setStartTime] = useState(row.startTime);
  const [endTime, setEndTime] = useState(row.endTime ?? row.startTime);

  const title =
    row.type === 'clockIn'
      ? 'Edit Clock In'
      : row.type === 'clockOut'
        ? 'Edit Clock Out'
        : row.type === 'break'
          ? `Edit ${row.label}`
          : 'Edit Absent Entry';

  const canDelete = row.type === 'break' || row.type === 'absent';
  const hasRange = row.type === 'break' || row.type === 'absent';

  const handleSave = () => {
    if (row.type === 'clockIn') {
      onSaveClockIn(startTime);
    } else if (row.type === 'clockOut') {
      onSaveClockOut(startTime);
    } else if (row.breakIndex != null) {
      onSaveBreak(row.breakIndex, startTime, endTime);
    }
    onClose();
  };

  const handleDelete = () => {
    if (row.breakIndex == null) return;

    if (row.type === 'absent') {
      Alert.alert(
        'Delete Absent Entry',
        'Are you sure you want to delete this absent entry? This will recalculate your sign-out time.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDeleteBreak(row.breakIndex!);
              onClose();
            },
          },
        ],
      );
    } else {
      onDeleteBreak(row.breakIndex);
      onClose();
    }
  };

  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      <TimePicker
        label={hasRange ? 'Start Time' : 'Time'}
        value={startTime}
        onChange={setStartTime}
      />

      {hasRange && (
        <TimePicker
          label="End Time"
          value={endTime}
          onChange={setEndTime}
        />
      )}

      <View style={styles.actions}>
        {canDelete && (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
        <View style={styles.rightActions}>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '90%',
    maxWidth: 360,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.normalTitle,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.workingBadgeText,
  },
  saveBtn: {
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.primaryButtonText,
  },
  deleteBtn: {
    backgroundColor: Colors.exceededBadgeBg,
    borderWidth: 1,
    borderColor: Colors.exceededBadgeBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  deleteText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.exceededBadgeText,
  },
});
