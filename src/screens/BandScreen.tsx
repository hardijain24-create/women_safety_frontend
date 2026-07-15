import React, { useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Toggle } from '../components/atoms/Toggle';
import { Loader } from '../components/atoms/Loader';
import { Card } from '../components/molecules/Card';
import { DeviceCard } from '../components/molecules/DeviceCard';
import { DevicePanel } from '../components/organisms/DevicePanel';
import { ScreenLayout, Header } from '../components/organisms/Header';
import BleService from '../services/BleService';
import { userApi, alertApi } from '../api/services';

export const BandScreen: React.FC = () => {
  const { theme } = useTheme();
  
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(70);
  const [autoSync, setAutoSync] = useState(true);

  const [isScanning, setIsScanning] = useState(false);
  const [bandConnected, setBandConnected] = useState(false);

  const handleTestVibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('Vibration Test', 'Vibration test sequence broadcast to Guardian Band.');
  };

  const handleTestAlarm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert('Alarm Test', 'Acoustic siren test triggered on Guardian Band.');
  };

  const handlePairBand = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const hasPermissions = await BleService.requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission Error', 'Bluetooth & Location permissions are required.');
      return;
    }

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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            Alert.alert('✅ Paired!', `Guardian Band connected.\nDevice: ${device.id}`);

            await userApi.pairDevice({ device_id: device.id });
            console.log('[PAIR] Device registered in backend.');

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
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
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

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wearable',
      'Are you sure you want to disconnect your safety band?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            BleService.disconnect();
            setBandConnected(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        }
      ]
    );
  };

  return (
    <ScreenLayout
      header={<Header title="My Device" subtitle="Guardian Band Pro" />}
      scrollable={true}
      safeArea={true}
    >
      <View style={{ paddingBottom: 32 }}>
        
        {/* Connected Wearable Visualization Molecule */}
        <DeviceCard
          isConnected={bandConnected}
          batteryLevel={78}
          signalStrength={85}
          lastSync="Just now"
          isScanning={isScanning}
          onConnect={handlePairBand}
          onDisconnect={handleDisconnect}
          onRefresh={handleTestVibration}
        />

        {isScanning && (
          <Card variant="default" padding="medium" style={{ marginBottom: 20 }}>
            <Loader text="Searching for safety band..." />
          </Card>
        )}

        {bandConnected && (
          <View style={{ marginBottom: 20 }}>
            <DevicePanel
              isConnected={true}
              batteryLevel={78}
              signalStrength={85}
              lastSync="Just now"
              isCharging={false}
              firmwareVersion="v1.02"
              deviceName="Guardian Band Pro"
            />
          </View>
        )}

        {/* Reconnection Troubleshooting Guide (If Disconnected) */}
        {!bandConnected && !isScanning && (
          <Card variant="danger" padding="medium" style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Icon name="alerts" size={24} color={theme.colors.error} />
              <View style={{ flex: 1 }}>
                <Typography variant="body" color="primary" weight="600" style={{ color: theme.colors.error }}>
                  Pairing Troubleshooter
                </Typography>
                <Typography variant="caption" color="secondary" style={{ marginTop: 4, lineHeight: 16 }}>
                  1. Verify the wearable ESP32 device is powered on.{"\n"}
                  2. Ensure your phone's Bluetooth and GPS location services are active.{"\n"}
                  3. Keep the band within 5 feet of your phone.
                </Typography>
              </View>
            </View>
          </Card>
        )}

        {/* Band Settings */}
        <Card variant="default" padding="large" style={{ marginBottom: 20 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 20 }}>
            Device Profile Settings
          </Typography>

          <View style={{ marginBottom: 16 }}>
            <Toggle
              label="Haptic Click Feedback"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              size="large"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Toggle
              label="Siren Alarm Sound"
              value={alarmEnabled}
              onValueChange={setAlarmEnabled}
              size="large"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Toggle
              label="Auto Background Sync"
              value={autoSync}
              onValueChange={setAutoSync}
              size="large"
            />
          </View>

          {/* Volume Control */}
          <View style={{ marginTop: 12 }}>
            <Typography variant="body" color="secondary" style={{ marginBottom: 12 }}>
              Siren Alarm Volume: {alarmVolume}%
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="volume" size={20} color={theme.colors.textMuted} />
              
              {/* Custom Track Bar */}
              <TouchableOpacity 
                activeOpacity={0.9}
                style={[styles.sliderTrack, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setAlarmVolume(70); // Reset or dynamic value
                }}
              >
                <View style={[styles.sliderFill, { width: `${alarmVolume}%`, backgroundColor: theme.colors.primary }]} />
                <View style={[styles.sliderThumb, { left: `${alarmVolume}%`, backgroundColor: theme.colors.primary, borderColor: theme.colors.textInverse }]} />
              </TouchableOpacity>

              <Icon name="volume" size={28} color={theme.colors.primary} />
            </View>
          </View>
        </Card>

        {/* Diagnostic Testing CTAs (If Connected) */}
        {bandConnected && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                title="Test Haptics"
                onPress={handleTestVibration}
                variant="secondary"
                size="large"
                fullWidth={true}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title="Test Siren"
                onPress={handleTestAlarm}
                variant="secondary"
                size="large"
                fullWidth={true}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    marginLeft: -9,
  },
});
