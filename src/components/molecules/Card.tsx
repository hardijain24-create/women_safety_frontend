import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme, elevation } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'danger' | 'success' | 'interactive';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
  accessibilityLabel,
  accessibilityRole,
}) => {
  const { theme } = useTheme();
  
  const scale = useSharedValue(1);

  const paddingStyles = {
    none: { padding: 0 },
    small: { padding: theme.card.padding - 8 },
    medium: { padding: theme.card.padding },
    large: { padding: theme.card.padding + 8 },
  };

  const { shadowOpacity: _, shadowColor: __, ...elevationSmProps } = elevation.sm;
  const { shadowOpacity: ___, shadowColor: ____, ...elevationMdProps } = elevation.md;

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.card.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: theme.card.minHeight,
    },
    elevated: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.card.radius,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      minHeight: theme.card.minHeight,
      ...elevationMdProps,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
    },
    glass: {
      backgroundColor: theme.colors.cardGlass,
      borderRadius: theme.card.radius,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      minHeight: theme.card.minHeight,
      overflow: 'hidden',
      ...elevationSmProps,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.04,
    },
    danger: {
      backgroundColor: theme.colors.error + '08', // 8% opacity red tint
      borderRadius: theme.card.radius,
      borderWidth: 1.5,
      borderColor: theme.colors.error,
      minHeight: theme.card.minHeight,
    },
    success: {
      backgroundColor: theme.colors.success + '08', // 8% opacity green tint
      borderRadius: theme.card.radius,
      borderWidth: 1.5,
      borderColor: theme.colors.success,
      minHeight: theme.card.minHeight,
    },
    interactive: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.card.radius,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: theme.card.minHeight,
      ...elevationSmProps,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.04,
    },
  };

  const cardStyle: ViewStyle = {
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...style,
  };

  // Reanimated press styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (variant === 'interactive' || onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (variant === 'interactive' || onPress) {
      scale.value = withSpring(1);
    }
  };

  const renderInnerContent = () => {
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

  if (onPress || variant === 'interactive') {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole || 'button'}
        >
          {renderInnerContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return renderInnerContent();
};
