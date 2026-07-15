import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Icon } from '../atoms/Icon';
import { Typography } from '../atoms/Typography';

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
  
  const scale = useSharedValue(1);

  const sizes = {
    small: { width: theme.buttonSizes.hero, height: theme.buttonSizes.hero, iconSize: 'sm' as const },
    medium: { width: theme.avatarSizes.xl, height: theme.avatarSizes.xl, iconSize: 'lg' as const },
    large: { width: theme.avatarSizes.xl + 16, height: theme.avatarSizes.xl + 16, iconSize: 'xl' as const },
  };

  const variantColors = {
    default: {
      bg: theme.colors.card,
      icon: theme.colors.primary,
      label: theme.colors.textSecondary,
      border: theme.colors.border,
    },
    primary: {
      bg: theme.colors.primary,
      icon: theme.colors.textInverse,
      label: theme.colors.primaryDark,
      border: 'transparent',
    },
    danger: {
      bg: theme.colors.error + '10',
      icon: theme.colors.error,
      label: theme.colors.error,
      border: theme.colors.error + '30',
    },
    gold: {
      bg: theme.colors.primaryLight + '20',
      icon: theme.colors.primaryDark,
      label: theme.colors.primaryDark,
      border: theme.colors.primaryLight + '50',
    },
  };

  const { width, height, iconSize } = sizes[size];
  const colors = variantColors[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 350 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={{ alignItems: 'center' }}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <View
          style={{
            width,
            height,
            borderRadius: width / 2,
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
            marginBottom: 8,
          }}
        >
          <Icon name={icon} size={iconSize} color={colors.icon} />
        </View>
        <Typography 
          variant="caption" 
          color="secondary"
          weight="600" 
          align="center"
          style={{ color: colors.label, maxWidth: width + 16 }}
          numberOfLines={2}
        >
          {label}
        </Typography>
      </TouchableOpacity>
    </Animated.View>
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
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: theme.layout.cardGap,
        paddingVertical: theme.spacing.sm + 4,
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
