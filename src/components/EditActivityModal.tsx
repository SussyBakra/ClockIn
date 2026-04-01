import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Alert, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts, FontSizes } from '../constants/typography';
import TimePicker from './TimePicker';
import type { RowType } from './ActivityRow';

export interface EditRowData {
  type: RowType;
  label: string;
  startTime: number;
  endTime?: number;
  breakIndex?: number;
}

const DELETE_LOG_TITLE = 'Delete Log';
const DELETE_LOG_MESSAGE = 'Are you sure you want to delete this log?';

interface Props {
  visible: boolean;
  row: EditRowData | null;
  onClose: () => void;
  onSaveClockIn: (time: number) => void;
  onSaveClockOut: (time: number) => void;
  onSaveBreak: (index: number, startTime: number, endTime: number) => void;
  onDeleteBreak: (index: number) => void;
  onDeleteClockIn: () => void | Promise<void>;
}

export default function EditActivityModal({
  visible,
  row,
  onClose,
  onSaveClockIn,
  onSaveClockOut,
  onSaveBreak,
  onDeleteBreak,
  onDeleteClockIn,
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
            key={`${row.type}-${row.startTime}-${row.breakIndex ?? ''}`}
            row={row}
            onClose={onClose}
            onSaveClockIn={onSaveClockIn}
            onSaveClockOut={onSaveClockOut}
            onSaveBreak={onSaveBreak}
            onDeleteBreak={onDeleteBreak}
            onDeleteClockIn={onDeleteClockIn}
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
  onDeleteClockIn,
}: Omit<Props, 'visible'> & { row: EditRowData }) {
  const [startTime, setStartTime] = useState(row.startTime);
  const [endTime, setEndTime] = useState(row.endTime ?? row.startTime);

  useEffect(() => {
    setStartTime(row.startTime);
    setEndTime(row.endTime ?? row.startTime);
  }, [row.type, row.startTime, row.endTime, row.breakIndex, row.label]);

  const title =
    row.type === 'clockIn'
      ? 'Edit Clock In'
      : row.type === 'clockOut'
        ? 'Edit Clock Out'
        : row.type === 'break'
          ? `Edit ${row.label}`
          : 'Edit Absent Entry';

  const canDelete = row.type === 'clockIn' || row.type === 'break' || row.type === 'absent';
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

  const confirmDeleteLog = (onConfirm: () => void | Promise<void>) => {
    Alert.alert(DELETE_LOG_TITLE, DELETE_LOG_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await Promise.resolve(onConfirm());
            onClose();
          })();
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (row.type === 'clockIn') {
      confirmDeleteLog(() => onDeleteClockIn());
      return;
    }

    if (row.breakIndex == null) return;

    if (row.type === 'absent') {
      confirmDeleteLog(() => onDeleteBreak(row.breakIndex!));
      return;
    }

    onDeleteBreak(row.breakIndex);
    onClose();
  };

  return (
    <View>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.formCard}>
        <TimePicker
          label={hasRange ? 'Start Time' : 'Time'}
          value={startTime}
          onChange={setStartTime}
          fullWidth
        />

        {hasRange && (
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={setEndTime}
            fullWidth
          />
        )}
      </View>

      <View style={styles.actionsColumn}>
        <Pressable style={styles.saveBtnFull} onPress={handleSave}>
          <Text style={styles.saveTextFull}>Save</Text>
        </Pressable>
        <Pressable style={styles.cancelBtnFull} onPress={onClose}>
          <Text style={styles.cancelTextFull}>Cancel</Text>
        </Pressable>
        {canDelete && (
          <Pressable style={styles.deleteBtnFull} onPress={handleDelete}>
            <Text style={styles.deleteTextFull}>Delete</Text>
          </Pressable>
        )}
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
  formCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  actionsColumn: {
    width: '100%',
  },
  saveBtnFull: {
    width: '100%',
    backgroundColor: Colors.primaryButton,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveTextFull: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.primaryButtonText,
  },
  cancelBtnFull: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  cancelTextFull: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.normalTitle,
  },
  deleteBtnFull: {
    width: '100%',
    backgroundColor: Colors.exceededBadgeBg,
    borderWidth: 1,
    borderColor: Colors.exceededBadgeBorder,
    borderRadius: 8,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTextFull: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.exceededBadgeText,
  },
});
