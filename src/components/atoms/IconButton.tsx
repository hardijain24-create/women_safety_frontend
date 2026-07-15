import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from './Icon';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'default',
  color,
  backgroundColor,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const getResolvedSizes = () => {
    const isSm = size === 'small' || size === 'sm';
    const isLg = size === 'large' || size === 'lg';

    if (isSm) {
      return { button: theme.buttonSizes.sm, icon: theme.iconSizes.sm };
    }
    if (isLg) {
      return { button: theme.buttonSizes.hero, icon: theme.iconSizes.xl };
    }
    // Default to medium (lg button, lg icon)
    return { button: theme.buttonSizes.lg, icon: theme.iconSizes.lg };
  };

  const { button: buttonSize, icon: iconSize } = getResolvedSizes();

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    if (variant === 'filled') return theme.colors.textPrimary;
    return 'transparent';
  };

  const getIconColor = () => {
    if (color) return color;
    if (variant === 'filled') return theme.colors.textInverse;
    return theme.colors.textPrimary;
  };

  const buttonStyle: ViewStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: getBackgroundColor(),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'outlined' ? 1.5 : 0,
    borderColor: theme.colors.border,
    opacity: disabled ? theme.opacity.disabled : 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={theme.opacity.pressed}
      style={buttonStyle}
    >
      <Icon name={icon} size={iconSize} color={getIconColor()} />
    </TouchableOpacity>
  );
};
