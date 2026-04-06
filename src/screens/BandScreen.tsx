import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Toggle } from '../components/atoms/Toggle';
import { Card } from '../components/molecules/Card';
import { ScreenLayout, Header } from '../components/organisms/Header';
import { mockDeviceStatus } from '../constants';

export const BandScreen: React.FC = () => {
  const { theme } = useTheme();
  const [deviceStatus] = useState(mockDeviceStatus);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(70);
  const [autoSync, setAutoSync] = useState(true);

  const handleTestVibration = () => {
    Alert.alert('Testing', 'Band vibration test sent');
  };

  const handleTestAlarm = () => {
    Alert.alert('Testing', 'Band alarm test sent');
  };

  return (
    <ScreenLayout
      header={<Header title="My Band" subtitle="Guardian Band Pro" />}
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Band Status */}
        <Card variant="glass" padding="large" style={{ marginBottom: 24 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: deviceStatus.isConnected
                  ? theme.colors.success + '20'
                  : theme.colors.error + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Icon
                name="band"
                size={64}
                color={deviceStatus.isConnected ? theme.colors.success : theme.colors.error}
              />
            </View>
            <Typography variant="h3" color="primary" style={{ marginBottom: 4 }}>
              Guardian Band Pro
            </Typography>
            <Typography variant="body" color="muted">
              {deviceStatus.isConnected ? 'Connected & Active' : 'Disconnected'}
            </Typography>
          </View>
        </Card>

        {/* Settings */}
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

          <View style={{ marginBottom: 20 }}>
            <Toggle
              label="Auto Sync"
              value={autoSync}
              onValueChange={setAutoSync}
              size="large"
            />
          </View>

          {/* Volume Control */}
          <View style={{ marginTop: 12 }}>
            <Typography variant="body" color="secondary" style={{ marginBottom: 12 }}>
              Alarm Volume: {alarmVolume}%
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="volume" size={20} color={theme.colors.textMuted} />
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: theme.colors.border,
                  borderRadius: 4,
                  marginHorizontal: 12,
                }}
              >
                <View
                  style={{
                    width: `${alarmVolume}%`,
                    height: 8,
                    backgroundColor: theme.colors.gold,
                    borderRadius: 4,
                  }}
                />
              </View>
              <Icon name="volume" size={28} color={theme.colors.navy} />
            </View>
          </View>
        </Card>

        {/* Test Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Test Vibration"
              onPress={handleTestVibration}
              variant="secondary"
              size="large"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Test Alarm"
              onPress={handleTestAlarm}
              variant="secondary"
              size="large"
            />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};
