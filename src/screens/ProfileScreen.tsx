import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Toggle } from '../components/atoms/Toggle';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { AuthContext } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = React.useContext(AuthContext);
  
  // Default values if user fields are missing
  const profileName = user?.name || 'User';
  const profileEmail = user?.email || '';
  
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
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
                {profileName.charAt(0).toUpperCase()}
              </Typography>
            </View>
            <Typography variant="h3" color="primary" style={{ marginBottom: 4 }}>
              {profileName}
            </Typography>
            <Typography variant="body" color="muted">
              {profileEmail}
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
            "Help! I need emergency assistance. Please contact me immediately."
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
