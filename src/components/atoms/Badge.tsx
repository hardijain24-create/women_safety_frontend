import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme, borderRadius } from '../../theme';
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
    small: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: borderRadius.xs },
    medium: { paddingVertical: theme.spacing.xs + 2, paddingHorizontal: theme.spacing.sm + 4, borderRadius: borderRadius.sm },
    large: { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md, borderRadius: borderRadius.md },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: theme.colors.primary + '15' }, // 8-10% opacity safety green tint
    success: { backgroundColor: theme.colors.success + '15' },
    warning: { backgroundColor: theme.colors.warning + '15' },
    error: { backgroundColor: theme.colors.error + '12' },
    neutral: { backgroundColor: theme.colors.backgroundSecondary }, // light neutral grey
    gold: { backgroundColor: theme.colors.primary + '15' }, // gold is aliased to safety green
  };

  const textColors = {
    primary: theme.colors.primaryDark,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    neutral: theme.colors.textSecondary,
    gold: theme.colors.primaryDark,
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
        alignSelf: 'flex-start',
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
      <Typography
        variant={textSizes[size]}
        style={{ color: textColors[variant] }}
        weight="600"
      >
        {label}
      </Typography>
    </View>
  );
};
