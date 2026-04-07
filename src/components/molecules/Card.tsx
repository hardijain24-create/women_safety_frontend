import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
}) => {
  const { theme } = useTheme();

  const paddingStyles = {
    none: { padding: 0 },
    small: { padding: 12 },
    medium: { padding: 20 },
    large: { padding: 28 },
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    glass: {
      backgroundColor: theme.colors.cardGlass,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    elevated: {
      backgroundColor: theme.colors.card,
      borderRadius: 28,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
  };

  const cardStyle: ViewStyle = {
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...style,
  };

  if (variant === 'glass') {
    return (
      <BlurView
        intensity={theme.isDark ? 60 : 80}
        tint={theme.colors.blurTint}
        style={cardStyle}
      >
        {children}
      </BlurView>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
