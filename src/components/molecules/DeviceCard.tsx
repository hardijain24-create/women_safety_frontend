import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';

interface DeviceCardProps {
  isConnected: boolean;
  batteryLevel: number;
  signalStrength: number;
  lastSync: string;
  firmwareVersion?: string;
  isScanning?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  isConnected,
  batteryLevel,
  signalStrength,
  lastSync,
  firmwareVersion = 'v1.02',
  isScanning = false,
  onConnect,
  onDisconnect,
  onRefresh,
}) => {
  const { theme } = useTheme();

  const getSignalQuality = (strength: number) => {
    if (strength > 75) return 'Excellent';
    if (strength > 45) return 'Good';
    if (strength > 15) return 'Fair';
    return 'Weak';
  };

  const styles = {
    card: {
      marginBottom: theme.layout.cardGap,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: theme.layout.cardGap,
    },
    telemetryRow: {
      flexDirection: 'row' as const,
      gap: theme.spacing.sm,
      marginBottom: theme.layout.cardGap,
      paddingTop: theme.spacing.sm + 4,
      borderTopWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    telemetryCell: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: theme.spacing.sm,
    },
    troubleText: {
      marginBottom: theme.layout.cardGap,
      lineHeight: 16,
    },
    actionsRow: {
      flexDirection: 'row' as const,
      gap: 10,
      marginTop: theme.spacing.xs,
    },
  };

  return (
    <Card variant="glass" padding="medium" style={styles.card}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon 
            name="band" 
            size="md" 
            color={isConnected ? theme.colors.primary : theme.colors.textMuted} 
            backgroundColor={isConnected ? theme.colors.primary + '12' : theme.colors.borderLight}
          />
          <View>
            <Typography variant="body" color="primary" weight="600">
              Guardian Band Pro
            </Typography>
            <Typography variant="caption" color="muted">
              {firmwareVersion ? `Firmware: ${firmwareVersion}` : 'ESP32 Device'}
            </Typography>
          </View>
        </View>
        <StatusBadge 
          label={isConnected ? 'Connected' : isScanning ? 'Scanning' : 'Offline'} 
          status={isConnected ? 'connected' : isScanning ? 'warning' : 'error'}
          showPulse={isConnected || isScanning}
          size="small"
        />
      </View>

      {/* Connection stats telemetry row */}
      {isConnected ? (
        <View style={styles.telemetryRow}>
          <View style={styles.telemetryCell}>
            <Icon name="battery-full" size="sm" color={theme.colors.primary} />
            <View>
              <Typography variant="caption" color="muted">Battery</Typography>
              <Typography variant="bodySmall" color="secondary" weight="600">{batteryLevel}%</Typography>
            </View>
          </View>

          <View style={styles.telemetryCell}>
            <Icon name="signal" size="sm" color={theme.colors.primary} />
            <View>
              <Typography variant="caption" color="muted">Signal</Typography>
              <Typography variant="bodySmall" color="secondary" weight="600">{getSignalQuality(signalStrength)}</Typography>
            </View>
          </View>

          <View style={styles.telemetryCell}>
            <Icon name="settings" size="sm" color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Typography variant="caption" color="muted">Last Sync</Typography>
              <Typography variant="bodySmall" color="secondary" weight="600" numberOfLines={1}>{lastSync}</Typography>
            </View>
          </View>
        </View>
      ) : (
        <Typography variant="bodySmall" color="muted" style={styles.troubleText}>
          {isScanning 
            ? "Searching for your ESP32 device nearby..." 
            : "Connect your safety band to activate automatic wearable SOS triggers."}
        </Typography>
      )}

      {/* Device Actions */}
      <View style={styles.actionsRow}>
        {isConnected ? (
          <>
            <Button
              title="Disconnect"
              onPress={onDisconnect}
              variant="outline"
              size="small"
              style={{ flex: 1 }}
            />
            <Button
              title="Refresh"
              onPress={onRefresh}
              variant="secondary"
              size="small"
              style={{ flex: 1 }}
            />
          </>
        ) : (
          <Button
            title={isScanning ? "Scanning..." : "Pair Device"}
            onPress={onConnect}
            variant="primary"
            size="medium"
            loading={isScanning}
            fullWidth={true}
          />
        )}
      </View>
    </Card>
  );
};
