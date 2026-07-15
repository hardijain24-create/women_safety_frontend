import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
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

export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = React.useContext(AuthContext);
  
  const profileName = user?.name || 'Elizabeth Johnson';
  const profileEmail = user?.email || 'elizabeth.j@email.com';
  
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);

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
            status="granted"
            onRequest={() => {}}
          />
          <PermissionCard
            title="Bluetooth Manager"
            description="Maintain syncing link with ESP32 wearable device"
            icon="band"
            status="granted"
            onRequest={() => {}}
          />
          <PermissionCard
            title="Direct SMS Sending"
            description="Send emergency alerts directly to your contacts"
            icon="phone"
            status="granted"
            onRequest={() => {}}
          />
        </View>

        {/* Preferences Toggles Settings Group */}
        <SettingsSection title="Preferences & Settings">
          <SettingsRow
            label="Dark Theme Interface"
            description="Toggle light/dark screen palette"
            icon="moon"
            rightComponent={
              <Toggle
                value={theme.isDark}
                onValueChange={toggleTheme}
                size="large"
              />
            }
          />
          <SettingsRow
            label="Auto Check-in Prompts"
            description="Prompt safety status at intervals"
            icon="check"
            rightComponent={
              <Toggle
                value={autoCheckIn}
                onValueChange={setAutoCheckIn}
                size="large"
              />
            }
          />
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
            rightComponent={
              <Toggle
                value={alarmEnabled}
                onValueChange={setAlarmEnabled}
                size="large"
              />
            }
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
