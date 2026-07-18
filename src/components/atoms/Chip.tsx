import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { Typography } from './Typography';
import { Icon } from './Icon';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'default',
  icon,
}) => {
  const { theme } = useTheme();

  const variantColors = {
    default: {
      bg: theme.colors.backgroundSecondary,
      text: theme.colors.textSecondary,
      border: theme.colors.border,
    },
    primary: {
      bg: theme.colors.primary + '15',
      text: theme.colors.primaryDark,
      border: theme.colors.primary,
    },
    success: {
      bg: theme.colors.success + '15',
      text: theme.colors.success,
      border: theme.colors.success,
    },
    warning: {
      bg: theme.colors.warning + '15',
      text: theme.colors.warning,
      border: theme.colors.warning,
    },
    danger: {
      bg: theme.colors.error + '15',
      text: theme.colors.error,
      border: theme.colors.error,
    },
  };

  const currentColors = variantColors[variant];

  const chipStyle = [
    styles.chip,
    {
      backgroundColor: selected ? theme.colors.primary : currentColors.bg,
      borderColor: selected ? 'transparent' : currentColors.border,
      borderWidth: selected ? 0 : 1,
      borderRadius: theme.card.radius - 4, // 16px - Standard chip shape
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs + 2,
    }
  ];

  const textColor = selected ? theme.colors.textInverse : currentColors.text;

  const content = (
    <View style={styles.content}>
      {icon && (
        <Icon 
          name={icon} 
          size="xs" // Align to the standard icon size token (16px)
          color={textColor} 
          containerStyle={{ marginRight: theme.spacing.xs }} 
        />
      )}
      <Typography 
        variant="caption" 
        weight="600" 
        style={{ color: textColor }}
      >
        {label}
      </Typography>
    </View>
  );

  const handlePress = () => {
    if (onPress) {
      Haptics.selectionAsync().catch(() => {});
      onPress();
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8} 
        style={chipStyle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={chipStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
