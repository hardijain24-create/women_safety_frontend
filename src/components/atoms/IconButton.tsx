import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from './Icon';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
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

  const sizes = {
    small: 40,
    medium: 56,
    large: 72,
  };

  const iconSizes = {
    small: 20,
    medium: 28,
    large: 36,
  };

  const buttonSize = sizes[size];
  const iconSize = iconSizes[size];

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    if (variant === 'filled') return theme.colors.navy;
    if (variant === 'outlined') return 'transparent';
    return 'transparent';
  };

  const getIconColor = () => {
    if (color) return color;
    if (variant === 'filled') return theme.colors.textInverse;
    return theme.colors.navy;
  };

  const buttonStyle: ViewStyle = {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: getBackgroundColor(),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: variant === 'outlined' ? 2 : 0,
    borderColor: theme.colors.navy,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      <Icon name={icon} size={iconSize} color={getIconColor()} />
    </TouchableOpacity>
  );
};
