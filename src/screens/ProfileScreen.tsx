import React, { useState, useEffect } from 'react';
import { View, Alert, Linking, Platform, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Toggle } from '../components/atoms/Toggle';
import { Badge } from '../components/atoms/Badge';
import { Avatar } from '../components/atoms/Avatar';
import { Divider } from '../components/atoms/Divider';
import { Card } from '../components/molecules/Card';
import { InfoTile } from '../components/molecules/InfoTile';
import { PermissionCard } from '../components/molecules/PermissionCard';
import { SettingsRow } from '../components/molecules/SettingsRow';
import { SettingsSection } from '../components/organisms/SettingsSection';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { AuthContext } from '../context/AuthContext';
import BleService from '../services/BleService';

export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = React.useContext(AuthContext);
  
  const profileName = user?.name || 'Elizabeth Johnson';
  const profileEmail = user?.email || 'elizabeth.j@email.com';
  
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);

  // Live Permission States
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'requesting'>('requesting');
  const [blePermission, setBlePermission] = useState<'granted' | 'denied' | 'requesting'>('requesting');
  const [smsPermission] = useState<'granted' | 'denied' | 'requesting'>('granted'); // SMS starts as mock active

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        setGpsPermission('granted');
        setBlePermission('denied');
        return;
      }

      // Check GPS
      const { status: gpsStatus } = await Location.getForegroundPermissionsAsync();
      setGpsPermission(gpsStatus === 'granted' ? 'granted' : gpsStatus === 'undetermined' ? 'requesting' : 'denied');

      // Check Bluetooth (BleService requires checking or requesting, we'll map connected device state or request permissions)
      const hasBle = await BleService.requestPermissions();
      setBlePermission(hasBle ? 'granted' : 'denied');
    } catch (e) {
      console.warn('Error checking permissions in ProfileScreen:', e);
    }
  };

  const handleRequestPermission = async (type: 'gps' | 'ble') => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Limitation',
        `${type === 'gps' ? 'Location' : 'Bluetooth'} permissions must be managed directly in your browser's preference settings.`
      );
      return;
    }

    if (type === 'gps') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setGpsPermission('granted');
      } else {
        setGpsPermission('denied');
        Alert.alert(
          'Location Access Required',
          'Please grant location permissions in system settings to share coordinates during an SOS trigger.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } else {
      const hasBle = await BleService.requestPermissions();
      if (hasBle) {
        setBlePermission('granted');
      } else {
        setBlePermission('denied');
        Alert.alert(
          'Bluetooth Access Required',
          'Please grant Bluetooth permissions in system settings to keep the Guardian Band paired.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to end your safety session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScreenLayout
      header={<Header title="My Profile" subtitle="Preferences & Medical ID" />}
      scrollable={true}
      safeArea={true}
    >
      <View style={{ paddingBottom: 48 }}>
        
        {/* Personal Information Group */}
        <Card variant="glass" padding="large" style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Profile Avatar */}
            <Avatar name={profileName} size={64} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Typography variant="h3" color="primary" weight="700">
                {profileName}
              </Typography>
              <Typography variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
                {profileEmail}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Medical Information Group (Medical ID Card) */}
        <Card variant="default" padding="medium" style={{ marginBottom: 20, borderStyle: 'dashed', borderColor: theme.colors.primary }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Typography variant="h4" color="primary" weight="700">
              🔴 Medical ID Details
            </Typography>
            <Badge label="Active" variant="success" size="small" />
          </View>
          
          <View style={styles.medicalGrid}>
            <InfoTile
              label="Blood Type"
              value="O+"
              icon="heart"
            />
            <InfoTile
              label="Allergies"
              value="None reported"
              icon="shield"
            />
            <InfoTile
              label="Asthma"
              value="Yes"
              icon="alerts"
            />
          </View>

          <Divider margin="medium" />
          <View style={{ marginTop: 4 }}>
            <Typography variant="caption" color="muted">Emergency Message Preset</Typography>
            <Typography variant="bodySmall" color="secondary" style={{ marginTop: 4, fontStyle: 'italic', lineHeight: 18 }}>
              "Help! This is Elizabeth. I need emergency assistance. My coordinates are attached below."
            </Typography>
          </View>
        </Card>

        {/* App Permissions Group */}
        <View style={{ marginBottom: 20 }}>
          <Typography variant="label" color="secondary" style={{ marginBottom: 8, marginLeft: 6, letterSpacing: 0.8 }}>
            SYSTEM PERMISSIONS
          </Typography>
          <PermissionCard
            title="GPS Location Services"
            description="Accurate coordinates sharing during SOS broadcast"
            icon="location-pin"
            status={gpsPermission}
            onRequest={() => handleRequestPermission('gps')}
          />
          <PermissionCard
            title="Bluetooth Manager"
            description="Maintain syncing link with ESP32 wearable device"
            icon="band"
            status={blePermission}
            onRequest={() => handleRequestPermission('ble')}
          />
          <PermissionCard
            title="Direct SMS Sending"
            description="Send emergency alerts directly to your contacts"
            icon="phone"
            status={smsPermission}
            onRequest={() => {}}
          />
        </View>

        {/* Preferences Toggles Settings Group */}
        {/* General Settings Section */}
        <SettingsSection title="General">
          <SettingsRow
            label="Dark Theme Interface"
            description="Toggle light/dark screen palette"
            icon="moon"
            noBorder={true}
            rightComponent={
              <Toggle
                value={theme.isDark}
                onValueChange={toggleTheme}
                size="large"
              />
            }
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsRow
            label="Auto Check-in Prompts"
            description="Prompt safety status at intervals"
            icon="check"
            noBorder={true}
            rightComponent={
              <Toggle
                value={autoCheckIn}
                onValueChange={setAutoCheckIn}
                size="large"
              />
            }
          />
        </SettingsSection>

        {/* Safety & Wearable Section */}
        <SettingsSection title="Safety & Device">
          <SettingsRow
            label="Auto Connect Wearable"
            description="Background device auto pairing"
            icon="band"
            rightComponent={
              <Toggle
                value={autoConnect}
                onValueChange={setAutoConnect}
                size="large"
              />
            }
          />
          <SettingsRow
            label="Physical Vibration Click"
            description="Vibration pulse on touch controls"
            icon="vibrate"
            rightComponent={
              <Toggle
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                size="large"
              />
            }
          />
          <SettingsRow
            label="Siren Alarm Sound"
            description="Trigger sirens during SOS"
            icon="volume"
            noBorder={true}
            rightComponent={
              <Toggle
                value={alarmEnabled}
                onValueChange={setAlarmEnabled}
                size="large"
              />
            }
          />
        </SettingsSection>

        {/* Support & Legal Section */}
        <SettingsSection title="Support & Legal">
          <SettingsRow
            label="Terms of Service"
            description="Read our usage policies and agreements"
            icon="shield"
            onPress={() => Alert.alert("Terms of Service", "Guardian Band Terms of Service v1.0.2.")}
          />
          <SettingsRow
            label="Privacy Policy"
            description="Understand how we handle and protect telemetry"
            icon="heart"
            noBorder={true}
            onPress={() => Alert.alert("Privacy Policy", "Guardian Band Privacy Policy v1.0.2.")}
          />
        </SettingsSection>

        {/* Logout Action */}
        <Button
          title="Sign Out Account"
          onPress={handleLogout}
          variant="danger"
          size="large"
          fullWidth={true}
        />

        {/* Build version info */}
        <Typography variant="caption" color="muted" align="center" style={{ marginTop: 24 }}>
          Guardian Band Pro • v1.0.2 Build 2026
        </Typography>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  medicalGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  medicalCell: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
