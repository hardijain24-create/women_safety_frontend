import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'gold';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'medium',
  icon,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    small: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
    medium: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
    large: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: theme.colors.navy + '20' },
    success: { backgroundColor: theme.colors.success + '30' },
    warning: { backgroundColor: theme.colors.warning + '30' },
    error: { backgroundColor: theme.colors.error + '20' },
    neutral: { backgroundColor: theme.colors.border },
    gold: { backgroundColor: theme.colors.gold + '25' },
  };

  const textColors = {
    primary: theme.colors.navy,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    neutral: theme.colors.textSecondary,
    gold: theme.colors.goldDark,
  };

  const textSizes = {
    small: 'caption' as const,
    medium: 'bodySmall' as const,
    large: 'body' as const,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
      <Typography
        variant={textSizes[size]}
        color={variant === 'gold' ? 'gold' : variant === 'error' ? 'error' : variant === 'success' ? 'secondary' : 'secondary'}
        weight="600"
      >
        {label}
      </Typography>
    </View>
  );
};
