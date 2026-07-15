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
import BleService from '../services/BleService';
import { userApi, alertApi } from '../api/services';
import * as Location from 'expo-location';

export const BandScreen: React.FC = () => {
  const { theme } = useTheme();
  const [deviceStatus] = useState(mockDeviceStatus);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(70);
  const [autoSync, setAutoSync] = useState(true);

  const [isScanning, setIsScanning] = useState(false);
  const [bandConnected, setBandConnected] = useState(BleService.isConnected());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setBandConnected(BleService.isConnected());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTestVibration = () => {
    Alert.alert('Testing', 'Band vibration test sent');
  };

  const handleTestAlarm = () => {
    Alert.alert('Testing', 'Band alarm test sent');
  };

  const handlePairBand = async () => {
    const hasPermissions = await BleService.requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission Error', 'Bluetooth & Location permissions are required.');
      return;
    }

    // Pre-request location permission NOW (not during SOS — avoids async hang)
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== 'granted') {
      Alert.alert('Permission Error', 'Location permission is required for SOS alerts.');
      return;
    }

    setIsScanning(true);
    BleService.scanForDevices(
      async (device) => {
        BleService.stopScan();
        setIsScanning(false);

        console.log('[PAIR] Found device:', device.name, device.id);

        try {
          const success = await BleService.connectToDevice(device.id);
          if (success) {
            setBandConnected(true);
            Alert.alert('✅ Paired!', `Guardian Band connected.\nDevice: ${device.id}`);

            // Map device → user account in backend
            await userApi.pairDevice({ device_id: device.id });
            console.log('[PAIR] Device registered in backend.');

            // Register the SOS handler AFTER connection is confirmed
            BleService.setOnSosTriggered(async () => {
              console.log('[SOS] Handler triggered! Getting location...');
              try {
                const loc = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.High,
                });
                const { latitude, longitude } = loc.coords;
                console.log(`[SOS] Location: ${latitude}, ${longitude}`);

                const payload = {
                  latitude,
                  longitude,
                  device_id: device.id,
                };
                console.log('[SOS] Sending to backend:', payload);

                const res = await alertApi.triggerAlert(payload);
                console.log('[SOS] Backend response:', res);
                Alert.alert('🚨 SOS SENT!', 'Emergency contacts have been notified!');
              } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || 'Unknown error';
                console.error('[SOS] FAILED to send alert:', msg);
                Alert.alert('SOS Failed', `Could not send alert: ${msg}`);
              }
            });
          } else {
            Alert.alert('Error', 'Failed to connect to band. Make sure it is powered on and press Pair again.');
          }
        } catch (e: any) {
          console.error('[PAIR] Error:', e?.message);
          Alert.alert('Error', `Connection error: ${e?.message}`);
        }
      },
      () => {
        setIsScanning(false);
        if (!BleService.isConnected()) {
          Alert.alert('Not Found', 'No Guardian Device found nearby.\n\nMake sure the ESP32 is powered on. Press the SOS button once to wake it, then try pairing again.');
        }
      }
    );
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
                backgroundColor: bandConnected
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
                color={bandConnected ? theme.colors.success : theme.colors.error}
              />
            </View>
            <Typography variant="h3" color="primary" style={{ marginBottom: 4 }}>
              Guardian Band Pro
            </Typography>
            <Typography variant="body" color="muted">
              {bandConnected ? 'Connected & Active' : 'Disconnected'}
            </Typography>

            {!bandConnected ? (
              <Button
                title={isScanning ? "Scanning..." : "Pair Guardian Device"}
                onPress={handlePairBand}
                disabled={isScanning}
                style={{ marginTop: 16 }}
              />
            ) : (
              <Button
                title="Disconnect Band"
                onPress={async () => {
                  await BleService.disconnect();
                  setBandConnected(false);
                }}
                variant="secondary"
                style={{ marginTop: 16 }}
              />
            )}
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
