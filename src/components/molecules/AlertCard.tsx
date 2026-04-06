import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from './Card';
import type { AlertItem } from '../../types';

interface AlertCardProps {
  alert: AlertItem;
  onPress?: () => void;
}

const alertTypeConfig = {
  sos: { icon: 'sos', label: 'SOS', color: 'error' as const },
  band_trigger: { icon: 'band', label: 'Band', color: 'warning' as const },
  check_in: { icon: 'check', label: 'Check-in', color: 'success' as const },
  battery_low: { icon: 'battery-low', label: 'Battery', color: 'warning' as const },
  system: { icon: 'bell', label: 'System', color: 'neutral' as const },
};

const severityConfig = {
  critical: 'error' as const,
  high: 'error' as const,
  medium: 'warning' as const,
  low: 'neutral' as const,
};

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const { theme } = useTheme();
  const typeConfig = alertTypeConfig[alert.type];

  return (
    <Card variant={alert.isRead ? 'default' : 'elevated'} padding="medium">
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors[typeConfig.color] + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <Icon name={typeConfig.icon} size={24} color={theme.colors[typeConfig.color]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography variant="body" color="primary" weight="600">
                {alert.title}
              </Typography>
              <Badge label={typeConfig.label} variant={typeConfig.color} size="small" />
            </View>
            <Typography variant="bodySmall" color="muted" style={{ marginBottom: 8 }}>
              {alert.message}
            </Typography>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="muted">
                {alert.timestamp}
              </Typography>
              <Badge 
                label={alert.severity} 
                variant={severityConfig[alert.severity]} 
                size="small" 
              />
            </View>
          </View>
          {!alert.isRead && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: theme.colors.gold,
                marginLeft: 12,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );
};
