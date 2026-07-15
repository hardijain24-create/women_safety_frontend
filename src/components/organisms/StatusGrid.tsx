import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { DeviceStatusCard } from '../molecules/StatusBadge';
import type { DeviceStatus } from '../../types';

interface StatusGridProps {
  deviceStatus: DeviceStatus;
  locationAccuracy?: number;
  lastSync?: string;
  onGPSPress?: () => void;
  onDevicePress?: () => void;
}

export const StatusGrid: React.FC<StatusGridProps> = ({
  deviceStatus,
  locationAccuracy = 4.5,
  lastSync = 'Just now',
  onGPSPress,
  onDevicePress,
}) => {
  const { theme } = useTheme();

  const styles = {
    grid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: theme.layout.cardGap - 4, // 12px gap
      width: '100%' as const,
    },
  };

  return (
    <View style={styles.grid}>
      <DeviceStatusCard
        title="Battery"
        value={`${deviceStatus.batteryLevel}%`}
        icon="battery-full"
        status={deviceStatus.batteryLevel > 20 ? 'good' : 'warning'}
        subtitle={deviceStatus.isCharging ? 'Charging' : 'On Battery'}
      />
      <DeviceStatusCard
        title="Network"
        value={`${deviceStatus.signalStrength}%`}
        icon="wifi"
        status={deviceStatus.signalStrength > 30 ? 'good' : 'warning'}
        subtitle="Connected"
      />
      <DeviceStatusCard
        title="GPS"
        value="Active"
        icon="location-pin"
        status="good"
        subtitle={`Acc: ${locationAccuracy}m`}
        onPress={onGPSPress}
      />
      <DeviceStatusCard
        title="Band"
        value={deviceStatus.isConnected ? 'Linked' : 'Off'}
        icon="band"
        status={deviceStatus.isConnected ? 'good' : 'critical'}
        subtitle={lastSync}
        onPress={onDevicePress}
      />
    </View>
  );
};
