import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Card } from '../molecules/Card';
import { StatusBadge } from '../molecules/StatusBadge';

interface DevicePanelProps {
  isConnected: boolean;
  batteryLevel: number;
  signalStrength: number;
  lastSync: string;
  isCharging: boolean;
  firmwareVersion?: string;
  deviceName?: string;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({
  isConnected,
  batteryLevel,
  signalStrength,
  lastSync,
  isCharging,
  firmwareVersion = 'v1.02',
  deviceName = 'ESP32 Wearable',
}) => {
  const { theme } = useTheme();

  const getBatteryIcon = () => {
    if (batteryLevel > 60) return 'battery-full';
    if (batteryLevel > 20) return 'battery-half';
    return 'battery-low';
  };

  const getBatteryColor = () => {
    if (batteryLevel > 60) return theme.colors.primary;
    if (batteryLevel > 20) return theme.colors.warning;
    return theme.colors.error;
  };

  const getSignalIcon = () => {
    if (signalStrength > 70) return 'wifi';
    return 'signal';
  };

  const getSignalColor = () => {
    if (signalStrength > 30) return theme.colors.primary;
    return theme.colors.warning;
  };

  return (
    <Card variant="glass" padding="medium">
      <View style={{ alignItems: 'center' }}>
        {/* Band Icon Core */}
        <View
          style={{
            width: theme.hero.profile,
            height: theme.hero.profile,
            borderRadius: theme.hero.profile / 2,
            backgroundColor: isConnected
              ? theme.colors.primary + '15'
              : theme.colors.error + '10',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.layout.cardGap,
          }}
        >
          <Icon
            name="band"
            size="hero" // Matches 48px from design system
            color={isConnected ? theme.colors.primary : theme.colors.error}
          />
        </View>

        <Typography variant="h3" color="primary" weight="600" style={{ marginBottom: theme.spacing.xs }}>
          {isConnected ? `${deviceName} Connected` : `${deviceName} Disconnected`}
        </Typography>
        
        <Typography variant="caption" color="muted" style={{ marginBottom: 8 }}>
          Firmware: {firmwareVersion}
        </Typography>
        
        <View style={{ marginBottom: theme.layout.screenPadding }}>
          <StatusBadge 
            label={isConnected ? "Active Protection" : "Offline"}
            status={isConnected ? "connected" : "error"}
            showPulse={isConnected}
            size="small"
          />
        </View>

        <Typography variant="caption" color="muted">
          Last synced: {lastSync}
        </Typography>

        {/* Status Grid info panels */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginTop: theme.layout.sectionGap,
            gap: theme.layout.cardGap - 4,
          }}
        >
          {/* Battery */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={getBatteryIcon()}
              size="lg" // 28px
              color={getBatteryColor()}
              backgroundColor={getBatteryColor() + '10'}
              containerStyle={{ marginBottom: theme.spacing.sm }}
            />
            <Typography variant="bodySmall" color="secondary" weight="600">
              {batteryLevel}%
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>Battery</Typography>
          </View>

          {/* Signal */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={getSignalIcon()}
              size="lg" // 28px
              color={getSignalColor()}
              backgroundColor={getSignalColor() + '10'}
              containerStyle={{ marginBottom: theme.spacing.sm }}
            />
            <Typography variant="bodySmall" color="secondary" weight="600">
              {signalStrength}%
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>Signal</Typography>
          </View>

          {/* Charging Status */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Icon
              name={isCharging ? 'check' : 'close'}
              size="lg" // 28px
              color={isCharging ? theme.colors.primary : theme.colors.textMuted}
              backgroundColor={isCharging ? theme.colors.primary + '10' : theme.colors.borderLight}
              containerStyle={{ marginBottom: theme.spacing.sm }}
            />
            <Typography variant="bodySmall" color="secondary" weight="600">
              {isCharging ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>Charging</Typography>
          </View>
        </View>
      </View>
    </Card>
  );
};
