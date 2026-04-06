import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    small: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
    medium: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16 },
    large: { paddingVertical: 20, paddingHorizontal: 32, borderRadius: 24 },
    xlarge: { paddingVertical: 24, paddingHorizontal: 40, borderRadius: 32 },
  };

  const textSizes = {
    small: { fontSize: 14, fontWeight: '600' as const },
    medium: { fontSize: 16, fontWeight: '600' as const },
    large: { fontSize: 18, fontWeight: '700' as const },
    xlarge: { fontSize: 20, fontWeight: '700' as const },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.navy,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: theme.colors.gold,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.navy,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderWidth: 0,
    },
  };

  const textColors = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.navy,
    outline: theme.colors.navy,
    ghost: theme.colors.navy,
    danger: theme.colors.textInverse,
  };

  const getButtonStyle = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled || loading ? 0.6 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  });

  const getTextStyle = (): TextStyle => ({
    color: textColors[variant],
    ...textSizes[size],
    ...textStyle,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColors[variant]} 
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
