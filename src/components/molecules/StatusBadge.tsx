import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
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

  // Connected status maps to calming primary safety green
  const statusColors = {
    connected: theme.status.connected,
    disconnected: theme.status.offline,
    warning: theme.status.connecting,
    error: theme.status.danger,
    success: theme.status.connected,
  };

  const dotSize = size === 'small' ? theme.spacing.sm : size === 'medium' ? theme.spacing.sm + 4 : theme.spacing.md;
  const iconSize = size === 'small' ? theme.iconSizes.xs : size === 'medium' ? theme.iconSizes.sm : theme.iconSizes.lg;
  const textVariant = size === 'small' ? 'caption' : size === 'medium' ? 'bodySmall' : 'body';

  const pulseOpacity = useSharedValue(0.4);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!showPulse) return;
    // Premium breathing pulse animation loop
    pulseOpacity.value = withRepeat(
      withTiming(0, { duration: 1800 }),
      -1,
      false
    );
    pulseScale.value = withRepeat(
      withTiming(2.2, { duration: 1800 }),
      -1,
      false
    );
  }, [showPulse]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showPulse ? (
        <View style={{ width: dotSize * 2.2, height: dotSize * 2.2, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
          {/* Animated pulse ring */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: statusColors[status],
              },
              animatedPulseStyle,
            ]}
          />
          {/* Static core dot */}
          <View
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: statusColors[status],
            }}
          />
        </View>
      ) : null}
      
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
  onPress?: () => void;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  title,
  value,
  icon,
  status = 'good',
  subtitle,
  onPress,
}) => {
  const { theme } = useTheme();

  const statusColors = {
    good: theme.status.connected,
    warning: theme.status.connecting,
    critical: theme.status.danger,
  };

  return (
    <Card 
      variant={onPress ? "interactive" : "glass"} 
      padding="medium" 
      style={{ flex: 1, minWidth: 140 }}
      onPress={onPress}
    >
      <View style={{ alignItems: 'center' }}>
        <Icon
          name={icon}
          size={28}
          color={statusColors[status]}
          backgroundColor={statusColors[status] + '12'} // 7-8% opacity tint background
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
