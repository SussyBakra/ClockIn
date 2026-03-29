import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FixedHeader from '../components/FixedHeader';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();
  const { settings } = state;

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState(String(settings.weeklyGoalHours));

  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [rateInput, setRateInput] = useState(String(settings.hourlyRate));

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(settings.name);
  const [emailInput, setEmailInput] = useState(settings.email);

  const headerHeight = insets.top + 60;

  const saveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { weeklyGoalHours: val } });
    }
    setGoalModalVisible(false);
  };

  const saveRate = () => {
    const val = parseFloat(rateInput);
    if (!isNaN(val) && val >= 0) {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { hourlyRate: val } });
    }
    setRateModalVisible(false);
  };

  const saveProfile = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { name: nameInput.trim() || 'User', email: emailInput.trim() },
    });
    setProfileModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <FixedHeader
        title="Settings"
        rightElement={<Ionicons name="settings" size={22} color="#6B7B8D" />}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Pressable style={styles.profileCard} onPress={() => setProfileModalVisible(true)}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{settings.name}</Text>
            <Text style={styles.profileEmail}>{settings.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CED4DA" />
        </Pressable>

        {/* App Preferences */}
        <Text style={styles.sectionLabel}>App Preferences</Text>
        <View style={styles.prefsCard}>
          <Pressable style={styles.prefRow} onPress={() => {
            setGoalInput(String(settings.weeklyGoalHours));
            setGoalModalVisible(true);
          }}>
            <View style={styles.prefLeft}>
              <Ionicons name="flag" size={20} color="#6C63FF" />
              <Text style={styles.prefLabel}>Weekly Goal</Text>
            </View>
            <View style={styles.prefRight}>
              <Text style={styles.prefValue}>{settings.weeklyGoalHours}h</Text>
              <Ionicons name="chevron-forward" size={18} color="#CED4DA" />
            </View>
          </Pressable>

          <View style={styles.prefDivider} />

          <Pressable style={styles.prefRow} onPress={() => {
            setRateInput(String(settings.hourlyRate));
            setRateModalVisible(true);
          }}>
            <View style={styles.prefLeft}>
              <Ionicons name="cash" size={20} color="#2ECC71" />
              <Text style={styles.prefLabel}>Hourly Rate</Text>
            </View>
            <View style={styles.prefRight}>
              <Text style={styles.prefValue}>${settings.hourlyRate}/hr</Text>
              <Ionicons name="chevron-forward" size={18} color="#CED4DA" />
            </View>
          </Pressable>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Ionicons name="notifications" size={20} color="#FF6B35" />
              <Text style={styles.prefLabel}>Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(val) =>
                dispatch({ type: 'UPDATE_SETTINGS', payload: { notifications: val } })
              }
              trackColor={{ false: '#E0E0E0', true: '#6C63FF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Ionicons name="moon" size={20} color="#4A5568" />
              <Text style={styles.prefLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(val) =>
                dispatch({ type: 'UPDATE_SETTINGS', payload: { darkMode: val } })
              }
              trackColor={{ false: '#E0E0E0', true: '#6C63FF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.versionText}>ClockIn v1.0.0</Text>
      </ScrollView>

      {/* Weekly Goal Modal */}
      <Modal visible={goalModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setGoalModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Set Weekly Goal</Text>
            <TextInput
              style={styles.modalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="Hours per week"
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSave]}
                onPress={saveGoal}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Hourly Rate Modal */}
      <Modal visible={rateModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setRateModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Set Hourly Rate</Text>
            <TextInput
              style={styles.modalInput}
              value={rateInput}
              onChangeText={setRateInput}
              keyboardType="decimal-pad"
              placeholder="$ per hour"
              placeholderTextColor="#A0AEC0"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setRateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSave]}
                onPress={saveRate}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setProfileModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalFieldLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor="#A0AEC0"
            />
            <Text style={styles.modalFieldLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="email@example.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSave]}
                onPress={saveProfile}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    minHeight: 48,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6B7B8D',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#6B7B8D',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingLeft: 4,
  },
  prefsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    marginBottom: 24,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  prefRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#1A1A2E',
  },
  prefValue: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: '#6B7B8D',
  },
  prefDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EDF2',
    marginHorizontal: 20,
  },
  versionText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A2E',
    marginBottom: 20,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#6B7B8D',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1A1A2E',
    marginBottom: 12,
    minHeight: 48,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalCancel: {
    backgroundColor: '#F4F6F8',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#4A5568',
  },
  modalSave: {
    backgroundColor: '#6C63FF',
  },
  modalSaveText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});
