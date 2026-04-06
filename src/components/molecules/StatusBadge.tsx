import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from './Card';

interface StatusBadgeProps {
  label: string;
  status: 'connected' | 'disconnected' | 'warning' | 'error' | 'success';
  icon?: string;
  showPulse?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status,
  icon,
  showPulse = false,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const statusColors = {
    connected: theme.colors.success,
    disconnected: theme.colors.textMuted,
    warning: theme.colors.warning,
    error: theme.colors.error,
    success: theme.colors.success,
  };

  const dotSize = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 20 : 26;
  const textVariant = size === 'small' ? 'caption' : size === 'medium' ? 'bodySmall' : 'body';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showPulse && (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: statusColors[status],
            marginRight: 8,
          }}
        />
      )}
      {icon && (
        <View style={{ marginRight: 6 }}>
          <Icon name={icon} size={iconSize} color={statusColors[status]} />
        </View>
      )}
      <Typography variant={textVariant} color="secondary" weight="600">
        {label}
      </Typography>
    </View>
  );
};

interface DeviceStatusCardProps {
  title: string;
  value: string;
  icon: string;
  status?: 'good' | 'warning' | 'critical';
  subtitle?: string;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  title,
  value,
  icon,
  status = 'good',
  subtitle,
}) => {
  const { theme } = useTheme();

  const statusColors = {
    good: theme.colors.success,
    warning: theme.colors.warning,
    critical: theme.colors.error,
  };

  return (
    <Card variant="glass" padding="medium" style={{ flex: 1, minWidth: 140 }}>
      <View style={{ alignItems: 'center' }}>
        <Icon
          name={icon}
          size={32}
          color={statusColors[status]}
          backgroundColor={statusColors[status] + '20'}
          containerStyle={{ marginBottom: 12 }}
        />
        <Typography variant="h4" color="primary" align="center">
          {value}
        </Typography>
        <Typography variant="caption" color="muted" align="center" style={{ marginTop: 4 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="secondary" align="center" style={{ marginTop: 2 }}>
            {subtitle}
          </Typography>
        )}
      </View>
    </Card>
  );
};
