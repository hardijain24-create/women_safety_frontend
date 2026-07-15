import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Card } from './Card';
import { Divider } from '../atoms/Divider';
import type { AlertItem } from '../../types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AlertCardProps {
  alert: AlertItem;
  onPress?: () => void;
}

const alertTypeConfig = {
  sos: { icon: 'sos', label: 'SOS Alert', color: 'error' as const },
  band_trigger: { icon: 'band', label: 'Band Pressed', color: 'error' as const },
  check_in: { icon: 'check', label: 'Safety Check-in', color: 'success' as const },
  battery_low: { icon: 'battery-low', label: 'Battery Warning', color: 'warning' as const },
  system: { icon: 'settings', label: 'System Notification', color: 'neutral' as const },
};

const severityConfig = {
  critical: 'error' as const,
  high: 'error' as const,
  medium: 'warning' as const,
  low: 'neutral' as const,
};

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const typeConfig = alertTypeConfig[alert.type] || alertTypeConfig.system;
  
  // Compute status if not explicitly provided
  const alertStatus = alert.status || (alert.isRead ? 'resolved' : alert.type === 'sos' ? 'active' : 'resolved');

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
    if (onPress) onPress();
  };

  return (
    <Card 
      variant={expanded ? "elevated" : "default"} 
      padding="medium"
      style={{ marginBottom: theme.layout.cardGap }}
    >
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Visual Indicator Dot for Unread Alerts */}
          {!alert.isRead && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: -8,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.colors.primary,
              }}
            />
          )}

          {/* Left Icon Container */}
          <View
            style={{
              width: theme.buttonSizes.md,
              height: theme.buttonSizes.md,
              borderRadius: theme.buttonSizes.md / 2,
              backgroundColor: theme.colors[typeConfig.color] + '12',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.layout.cardGap,
            }}
          >
            <Icon name={typeConfig.icon} size="md" color={theme.colors[typeConfig.color]} />
          </View>

          {/* Details Section */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
              <Typography variant="body" color="primary" weight="600" style={{ flex: 1, marginRight: 8 }}>
                {alert.title}
              </Typography>
              <Badge label={typeConfig.label} variant={typeConfig.color} size="small" />
            </View>

            <Typography variant="bodySmall" color="secondary" numberOfLines={expanded ? undefined : 2} style={{ marginBottom: 8 }}>
              {alert.message}
            </Typography>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="muted">
                {alert.timestamp}
              </Typography>
              
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {/* Severity Badge */}
                <Badge 
                  label={alert.severity.toUpperCase()} 
                  variant={severityConfig[alert.severity]} 
                  size="small" 
                />
                
                {/* Status Badge */}
                <Badge 
                  label={alertStatus.toUpperCase()} 
                  variant={alertStatus === 'active' ? 'error' : 'success'} 
                  size="small" 
                />
              </View>
            </View>

            {/* Expandable Panel Details */}
            {expanded && (
              <View style={{ marginTop: theme.layout.cardGap }}>
                <Divider margin="medium" />
                <Typography variant="caption" color="muted" style={{ marginBottom: theme.spacing.xs }}>
                  Detailed Diagnostics
                </Typography>
                <Typography variant="bodySmall" color="secondary" style={{ marginBottom: 8 }}>
                  Incident ID: {alert.id}
                  {"\n"}Alert Category: {alert.type.toUpperCase()}
                  {"\n"}Notification State: {alert.isRead ? 'Archived / Read' : 'New / Unread'}
                </Typography>
                
                {alert.type === 'sos' && (
                  <Typography variant="bodySmall" color="error" weight="600">
                    ℹ️ Emergency alert was broadcast to all active guardians.
                  </Typography>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
