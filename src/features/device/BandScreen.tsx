import React from 'react';
import { View, StyleSheet } from 'react-native';


import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Button, Typography, Icon, Toggle, ProgressRing } from '../../components/atoms';
import { Card, SettingsRow } from '../../components/molecules';
import { ScreenLayout, Header } from '../../components/organisms';
import { useBle } from '../../context/BleContext';
import { useSettings } from '../../context/SettingsContext';
import { showAlert } from '../../utils/alert';

export const BandScreen: React.FC = () => {
  const { theme } = useTheme();
  
  const {
    isConnected,
    isScanning,
    isAvailable,
    batteryLevel,
    signalStrength,
    firmwareVersion,
    scannedDevices,
    scanForDevices,
    connect,
    disconnect,
    testVibration,
    testAlarm,
  } = useBle();

  const {
    vibrationEnabled,
    alarmEnabled,
    autoConnect: autoSync,
    setVibrationEnabled,
    setAlarmEnabled,
    setAutoConnect: setAutoSync,
  } = useSettings();



  const handlePair = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await scanForDevices();
      // Auto-connect to first scanned device for testing/mock simplicity if found
      if (scannedDevices.length > 0) {
        await connect(scannedDevices[0].id);
      } else {
        // Fallback pair with mock device
        await connect('esp32-safety-band-v2');
      }
    } catch (e: any) {
      showAlert('Connection Failed', e.message || 'Bluetooth initialization failed.');
    }
  };

  const handleDisconnect = () => {
    showAlert('Disconnect Device', 'Are you sure you want to unpair your Guardian Band?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', style: 'destructive', onPress: disconnect },
    ]);
  };

  const handleTestVib = async () => {
    try {
      await testVibration();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showAlert('Haptic Sent', 'Vibration test broadcast successfully.');
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (e?.message === 'Not supported on web') {
        showAlert('Not Supported', 'Bluetooth is unsupported on the web version.');
      } else {
        showAlert('Test Failed', e?.message || 'Failed to trigger haptic vibration.');
      }
    }
  };

  const handleTestAlm = async () => {
    try {
      await testAlarm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      showAlert('Acoustic Sent', 'Siren alarm test triggered on wearable.');
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (e?.message === 'Not supported on web') {
        showAlert('Not Supported', 'Bluetooth is unsupported on the web version.');
      } else {
        showAlert('Test Failed', e?.message || 'Failed to trigger siren alarm.');
      }
    }
  };

  return (
    <ScreenLayout header={<Header title="My Device" subtitle="Guardian Watch Sync" />} scrollable safeArea>
      <View style={{ paddingBottom: 32 }}>
        
        {/* Apple Watch style Bluetooth Pairing Console */}
        <Card variant="glass" padding="medium" style={styles.radarCard}>
          <View style={[styles.radarOuterRing, { borderColor: isConnected ? theme.colors.success + '30' : theme.colors.primary + '15' }]}>
            <View style={[styles.radarInnerRing, { borderColor: isConnected ? theme.colors.success + '50' : theme.colors.primary + '30' }]}>
              <View style={[styles.radarCenter, { backgroundColor: isConnected ? theme.colors.success : theme.colors.primary }]}>
                <Icon name={isConnected ? 'check' : 'band'} size={32} color={theme.colors.textInverse} />
              </View>
            </View>
          </View>

          <Typography variant="h3" color="primary" weight="600" style={{ marginTop: 16 }}>
            {!isAvailable ? 'Bluetooth Unavailable' : isConnected ? 'Guardian Band Connected' : isScanning ? 'Scanning for band...' : 'Band not connected'}
          </Typography>
          <Typography variant="caption" color="muted" style={{ marginTop: 4, marginBottom: 20, textAlign: 'center' }}>
            {!isAvailable
              ? 'Bluetooth is unsupported in Expo Go. A custom developer build is required for BLE feature testing.'
              : isConnected
                ? `Firmware: ${firmwareVersion} • RSSI: ${signalStrength === 'Unavailable' ? 'Unavailable' : `-${signalStrength}dBm`}`
                : 'Bluetooth low energy connection'}
          </Typography>

          {!isConnected ? (
            <Button
              title={isScanning ? 'Scanning...' : 'Pair Guardian Band'}
              onPress={handlePair}
              variant="primary"
              size="medium"
              loading={isScanning}
              disabled={!isAvailable}
            />
          ) : (
            <Button title="Unpair Device" onPress={handleDisconnect} variant="outline" size="medium" />
          )}
        </Card>

        {/* Diagnostic Telemetry Panel */}
        {isConnected && (() => {
          const getConnectionStatus = (rssi: number | 'Unavailable' | null) => {
            if (rssi === null) return 'N/A';
            if (rssi === 'Unavailable') return 'Unavailable';
            const positiveRssi = Math.abs(rssi);
            if (positiveRssi <= 60) return 'Excellent';
            if (positiveRssi <= 75) return 'Good';
            if (positiveRssi <= 85) return 'Fair';
            return 'Weak';
          };
          const connectionStatus = getConnectionStatus(signalStrength);
          return (
            <Card variant="default" padding="medium" style={styles.telemetryCard}>
              <View style={styles.telemetryRow}>
                <View style={styles.telemetryItem}>
                  <Typography variant="caption" color="muted" style={{ marginBottom: 6 }}>Battery</Typography>
                  <ProgressRing
                    progress={batteryLevel === 'Unavailable' || batteryLevel === null ? 0 : batteryLevel}
                    size={40}
                    strokeWidth={4}
                    color={theme.colors.primary}
                    showText={true}
                  />
                </View>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <View style={styles.telemetryItem}>
                  <Typography variant="caption" color="muted" style={{ marginBottom: 6 }}>Signal</Typography>
                  <ProgressRing
                    progress={signalStrength === 'Unavailable' || signalStrength === null ? 0 : Math.max(0, 100 - Math.abs(signalStrength))}
                    size={40}
                    strokeWidth={4}
                    color={connectionStatus === 'Weak' || connectionStatus === 'Unavailable' ? theme.colors.error : theme.colors.primary}
                    showText={false}
                  />
                  <Typography variant="caption" color="secondary" style={{ marginTop: 2, fontSize: 10 }}>
                    {connectionStatus}
                  </Typography>
                </View>

                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <View style={styles.telemetryItem}>
                  <Typography variant="caption" color="muted" style={{ marginBottom: 6 }}>Sync Status</Typography>
                  <Icon
                    name={autoSync ? "check" : "close"}
                    size={18}
                    color={autoSync ? theme.colors.primary : theme.colors.textMuted}
                    containerStyle={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: theme.colors.backgroundSecondary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </View>
              </View>
            </Card>
          );
        })()}
 
        {/* Device Configuration Sliders */}
        <Card variant="default" padding="medium" style={{ marginBottom: 20 }}>
          <Typography variant="h4" color="primary" style={{ marginBottom: 12 }}>
            Wearable Configuration
          </Typography>
          <SettingsRow
            label="Haptic Click Feedback"
            description="Vibrate on safety actions"
            icon="vibrate"
            rightComponent={
              <Toggle value={vibrationEnabled} onValueChange={setVibrationEnabled} size="large" />
            }
          />
          <SettingsRow
            label="Siren Acoustic Alarm"
            description="Sound siren alarm during SOS"
            icon="volume"
            rightComponent={
              <Toggle value={alarmEnabled} onValueChange={setAlarmEnabled} size="large" />
            }
          />
          <SettingsRow
            label="Background Auto-Sync"
            description="Background device auto pairing"
            icon="band"
            noBorder
            rightComponent={
              <Toggle value={autoSync} onValueChange={setAutoSync} size="large" />
            }
          />
        </Card>
 
        {/* Wearable Diagnostics triggers */}
        <View style={styles.testsRow}>
          <View style={{ flex: 1 }}>
            <Button title="Test Haptics" onPress={handleTestVib} variant="secondary" size="medium" disabled={!isConnected} fullWidth />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Test Siren" onPress={handleTestAlm} variant="secondary" size="medium" disabled={!isConnected} fullWidth />
          </View>
        </View>
      </View>
    </ScreenLayout>
  );
};


const styles = StyleSheet.create({
  radarCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  radarOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  radarInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  telemetryCard: {
    marginBottom: 20,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  dividerLine: {
    width: 1,
    height: 32,
  },
  testsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
