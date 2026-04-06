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
      borderRadius: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    glass: {
      backgroundColor: theme.colors.cardGlass,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      overflow: 'hidden',
    },
    elevated: {
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderRadius: 24,
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
        intensity={theme.isDark ? 40 : 60}
        tint={theme.colors.blurTint}
        style={cardStyle}
      >
        {children}
      </BlurView>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
