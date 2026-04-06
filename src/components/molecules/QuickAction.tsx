import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';
import { Card } from './Card';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'gold';
  size?: 'small' | 'medium' | 'large';
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  onPress,
  variant = 'default',
  size = 'large',
}) => {
  const { theme } = useTheme();

  const sizes = {
    small: { width: 64, height: 64, iconSize: 24 },
    medium: { width: 80, height: 80, iconSize: 32 },
    large: { width: 100, height: 100, iconSize: 40 },
  };

  const variantColors = {
    default: {
      bg: theme.colors.card,
      icon: theme.colors.navy,
      label: theme.colors.textSecondary,
    },
    primary: {
      bg: theme.colors.navy,
      icon: theme.colors.textInverse,
      label: theme.colors.navy,
    },
    danger: {
      bg: theme.colors.error,
      icon: theme.colors.textInverse,
      label: theme.colors.error,
    },
    gold: {
      bg: theme.colors.gold,
      icon: theme.colors.navy,
      label: theme.colors.goldDark,
    },
  };

  const { width, height, iconSize } = sizes[size];
  const colors = variantColors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ alignItems: 'center' }}
    >
      <View
        style={{
          width,
          height,
          borderRadius: width / 2,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
          marginBottom: 8,
        }}
      >
        <Icon name={icon} size={iconSize} color={colors.icon} />
      </View>
      <Typography variant="bodySmall" color={variant === 'default' ? 'muted' : variant === 'danger' ? 'error' : 'secondary'} weight="600" align="center">
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

interface QuickActionGridProps {
  actions: {
    icon: string;
    label: string;
    onPress: () => void;
    variant?: 'default' | 'primary' | 'danger' | 'gold';
  }[];
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ actions }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 16,
      }}
    >
      {actions.map((action, index) => (
        <QuickAction
          key={index}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          variant={action.variant}
        />
      ))}
    </View>
  );
};
