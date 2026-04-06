import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Card } from '../molecules/Card';
import type { DeviceStatus } from '../../types';

interface DevicePanelProps {
  deviceStatus: DeviceStatus;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({ deviceStatus }) => {
  const { theme } = useTheme();

  const getBatteryIcon = () => {
    if (deviceStatus.batteryLevel > 60) return 'battery-full';
    if (deviceStatus.batteryLevel > 20) return 'battery-half';
    return 'battery-low';
  };

  const getBatteryColor = () => {
    if (deviceStatus.batteryLevel > 60) return theme.colors.success;
    if (deviceStatus.batteryLevel > 20) return theme.colors.warning;
    return theme.colors.error;
  };

  const getSignalIcon = () => {
    if (deviceStatus.signalStrength > 70) return 'wifi';
    if (deviceStatus.signalStrength > 30) return 'signal';
    return 'signal';
  };

  return (
    <Card variant="glass" padding="large">
      <View style={{ alignItems: 'center' }}>
        {/* Band Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: deviceStatus.isConnected
              ? theme.colors.success + '20'
              : theme.colors.error + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Icon
            name="band"
            size={40}
            color={deviceStatus.isConnected ? theme.colors.success : theme.colors.error}
          />
        </View>

        <Typography variant="h3" color="primary" style={{ marginBottom: 4 }}>
          {deviceStatus.isConnected ? 'Band Connected' : 'Band Disconnected'}
        </Typography>
        <Typography variant="body" color="muted">
          Last synced: {deviceStatus.lastSync}
        </Typography>

        {/* Status Grid */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginTop: 24,
            gap: 12,
          }}
        >
          {/* Battery */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={getBatteryIcon()}
              size={28}
              color={getBatteryColor()}
            />
            <Typography variant="bodySmall" color="secondary" weight="600" style={{ marginTop: 8 }}>
              {deviceStatus.batteryLevel}%
            </Typography>
            <Typography variant="caption" color="muted">Battery</Typography>
          </View>

          {/* Signal */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={getSignalIcon()}
              size={28}
              color={deviceStatus.signalStrength > 30 ? theme.colors.success : theme.colors.warning}
            />
            <Typography variant="bodySmall" color="secondary" weight="600" style={{ marginTop: 8 }}>
              {deviceStatus.signalStrength}%
            </Typography>
            <Typography variant="caption" color="muted">Signal</Typography>
          </View>

          {/* Charging */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={deviceStatus.isCharging ? 'check' : 'close'}
              size={28}
              color={deviceStatus.isCharging ? theme.colors.success : theme.colors.textMuted}
            />
            <Typography variant="bodySmall" color="secondary" weight="600" style={{ marginTop: 8 }}>
              {deviceStatus.isCharging ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" color="muted">Charging</Typography>
          </View>
        </View>
      </View>
    </Card>
  );
};
