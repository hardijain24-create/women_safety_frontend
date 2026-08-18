import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

import { Button, Typography, Toggle, Avatar, Input } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { ScreenLayout, Header } from '../../components/organisms';
import { SettingsSection } from '../../components/organisms/SettingsSection';
import { SettingsRow } from '../../components/molecules/SettingsRow';
import { PermissionCard } from '../../components/molecules/PermissionCard';
import { AuthContext } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import BleService from '../../services/BleService';
import { userApi } from '../../api/services';
import { showAlert } from '../../utils/alert';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useContext(AuthContext);

  const {
    vibrationEnabled,
    alarmEnabled,
    autoConnect,
    fakeCallerName,
    fakeCallDelay,
    setVibrationEnabled,
    setAlarmEnabled,
    setAutoConnect,
    setFakeCallerName,
    setFakeCallDelay,
  } = useSettings();

  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'requesting'>('requesting');
  const [blePermission, setBlePermission] = useState<'granted' | 'denied' | 'requesting'>('requesting');

  const [pin, setPin] = useState(user?.safety_pin || '');
  const [isSavingPin, setIsSavingPin] = useState(false);

  const handleSavePin = async () => {
    if (pin.length !== 4) {
      showAlert('Invalid PIN', 'Safety PIN must be exactly 4 digits.');
      return;
    }
    setIsSavingPin(true);
    try {
      const res = await userApi.updateProfile({ safety_pin: pin });
      if (res.success && res.data) {
        updateUser(res.data);
        showAlert('Success', 'Safety PIN updated successfully!');
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to save PIN.');
    } finally {
      setIsSavingPin(false);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'web') {
      setGpsPermission('granted');
      setBlePermission('denied');
      return;
    }
    const { status } = await Location.getForegroundPermissionsAsync();
    setGpsPermission(status === 'granted' ? 'granted' : 'denied');

    const hasBle = await BleService.requestPermissions();
    setBlePermission(hasBle ? 'granted' : 'denied');
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleLogout = () => {
    showAlert('Sign Out', 'Are you sure you want to end your safety session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleRequestPermission = async (type: 'gps' | 'ble') => {
    if (Platform.OS === 'web') return;
    if (type === 'gps') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setGpsPermission(status === 'granted' ? 'granted' : 'denied');
      if (status !== 'granted') Linking.openSettings();
    } else {
      const hasBle = await BleService.requestPermissions();
      setBlePermission(hasBle ? 'granted' : 'denied');
      if (!hasBle) Linking.openSettings();
    }
  };

  return (
    <ScreenLayout header={<Header title="My Profile" subtitle="Preferences" />} scrollable safeArea>
      <View style={{ paddingBottom: 48 }}>
        
        {/* User Card */}
        <Card variant="glass" padding="medium" style={styles.userCard}>
          <View style={styles.userRow}>
            <Avatar name={user?.name || 'User'} size="lg" />
            <View style={{ marginLeft: 16 }}>
              <Typography variant="h3" color="primary" weight="600">{user?.name || 'Elizabeth Johnson'}</Typography>
              <Typography variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>{user?.email || 'elizabeth@domain.com'}</Typography>
            </View>
          </View>
        </Card>


        {/* System Permissions */}
        <View style={styles.sectionHeader}>
          <Typography variant="label" color="secondary" weight="500">SYSTEM PERMISSIONS</Typography>
        </View>
        <PermissionCard title="GPS Location Services" description="Accurate coordinates sharing" icon="location-pin" status={gpsPermission} onRequest={() => handleRequestPermission('gps')} />
        <PermissionCard title="Bluetooth Manager" description="Sync link with ESP32 wearable" icon="band" status={blePermission} onRequest={() => handleRequestPermission('ble')} />

        {/* Preferences Toggles */}

        <SettingsSection title="Safety & Sync">
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <Typography variant="label" color="secondary" weight="500" style={{ marginBottom: 8 }}>
              Emergency Deactivation PIN
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Input
                  value={pin}
                  onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="4-digit PIN"
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <Button title="Save" onPress={handleSavePin} loading={isSavingPin} variant="primary" size="medium" />
            </View>
          </View>
          <SettingsRow label="Auto Connect Wearable" description="Background device auto pairing" icon="band" rightComponent={<Toggle value={autoConnect} onValueChange={setAutoConnect} size="large" />} />
          <SettingsRow label="Haptic Feedback Click" description="Vibrate on safety actions" icon="vibrate" rightComponent={<Toggle value={vibrationEnabled} onValueChange={setVibrationEnabled} size="large" />} />
          <SettingsRow label="Acoustic Emergency Siren" description="Sound siren alarm during SOS" icon="volume" noBorder rightComponent={<Toggle value={alarmEnabled} onValueChange={setAlarmEnabled} size="large" />} />
        </SettingsSection>

        <SettingsSection title="Fake Call Decoy">
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <Typography variant="label" color="secondary" weight="500" style={{ marginBottom: 8 }}>
              Fake Caller Name
            </Typography>
            <Input
              value={fakeCallerName}
              onChangeText={setFakeCallerName}
              placeholder="e.g. Mom"
            />
          </View>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <Typography variant="label" color="secondary" weight="500" style={{ marginBottom: 8 }}>
              Call Delay (Seconds)
            </Typography>
            <Input
              value={fakeCallDelay.toString()}
              onChangeText={(text) => {
                const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
                setFakeCallDelay(isNaN(num) ? 0 : num);
              }}
              placeholder="5"
              keyboardType="numeric"
            />
          </View>
        </SettingsSection>

        <SettingsSection title="Support & Legal">
          <SettingsRow label="Terms of Service" description="Usage terms and guidelines" icon="shield" onPress={() => showAlert('Terms', 'Guardian Band ToS v1.0.2')} />
          <SettingsRow label="Privacy Policy" description="How we encrypt your coordinates" icon="heart" noBorder onPress={() => showAlert('Privacy', 'Guardian Band Privacy Policy v1.0.2')} />
        </SettingsSection>

        {/* Logout Button */}
        <Button title="Sign Out Safety Account" onPress={handleLogout} variant="danger" size="large" fullWidth style={{ marginTop: 24 }} />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  userCard: {
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    marginLeft: 6,
    marginBottom: 8,
  },
});
