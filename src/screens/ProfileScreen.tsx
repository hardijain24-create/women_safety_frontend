import React, { useState } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Toggle } from '../components/atoms/Toggle';
import { Icon } from '../components/atoms/Icon';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { mockUserProfile } from '../constants';

export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [profile, setProfile] = useState(mockUserProfile);
  const [autoCheckIn, setAutoCheckIn] = useState(profile.autoCheckInEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState(profile.vibrationEnabled);
  const [alarmEnabled, setAlarmEnabled] = useState(profile.alarmEnabled);
  const [autoConnect, setAutoConnect] = useState(profile.autoConnectBand);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.navigate('Auth' as never),
        },
      ]
    );
  };

  return (
    <ScreenLayout
      header={<Header title="Profile" subtitle="Settings & Preferences" />}
    >
      <View style={{ paddingBottom: 32 }}>
        {/* User Card */}
        <Card variant="glass" padding="large" style={{ marginBottom: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: theme.colors.navy,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Typography variant="h2" color="inverse">
                {profile.name.charAt(0)}
              </Typography>
            </View>
            <Typography variant="h3" color="primary" style={{ marginBottom: 4 }}>
              {profile.name}
            </Typography>
            <Typography variant="body" color="muted">
              {profile.email}
            </Typography>
            <Typography variant="bodySmall" color="secondary" style={{ marginTop: 4 }}>
              {profile.phone}
            </Typography>
          </View>
        </Card>

        {/* Settings */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 20 }}>
            App Settings
          </Typography>

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Dark Theme"
              value={theme.isDark}
              onValueChange={toggleTheme}
              size="large"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Auto Check-in"
              value={autoCheckIn}
              onValueChange={setAutoCheckIn}
              size="large"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Auto Connect Band"
              value={autoConnect}
              onValueChange={setAutoConnect}
              size="large"
            />
          </View>
        </Card>

        {/* Band Settings */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 20 }}>
            Band Settings
          </Typography>

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Vibration Alerts"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              size="large"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Alarm Sound"
              value={alarmEnabled}
              onValueChange={setAlarmEnabled}
              size="large"
            />
          </View>
        </Card>

        {/* Emergency Message */}
        <Card variant="default" padding="large" style={{ marginBottom: 16 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 12 }}>
            Emergency Message
          </Typography>
          <Typography variant="body" color="secondary">
            "{profile.emergencyMessage}"
          </Typography>
          <Button
            title="Edit Message"
            onPress={() => Alert.alert('Coming Soon', 'Edit feature coming soon')}
            variant="ghost"
            size="small"
            style={{ marginTop: 12, alignSelf: 'flex-start' }}
          />
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="large"
        />

        {/* Version */}
        <Typography variant="caption" color="muted" align="center" style={{ marginTop: 24 }}>
          Guardian Band v1.0.0
        </Typography>
      </View>
    </ScreenLayout>
  );
};
