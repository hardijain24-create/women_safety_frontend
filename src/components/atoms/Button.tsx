import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useTheme, elevation, borderRadius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'sm' | 'md' | 'lg' | 'hero' | 'sos';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;

  pulse?: boolean;
  fullWidth?: boolean;
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
  pulse = false,
  fullWidth = false,
}) => {
  const { theme } = useTheme();

  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Pulse animation optimization
  useEffect(() => {
    if (!pulse) {
      pulseScale.value = 1;
      return;
    }

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: theme.animation.pulse / 2 }),
        withTiming(1, { duration: theme.animation.pulse / 2 })
      ),
      -1
    );
  }, [pulse, pulseScale, theme.animation.pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: theme.animation.spring.damping,
      stiffness: theme.animation.spring.stiffness,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: theme.animation.spring.damping,
      stiffness: theme.animation.spring.stiffness,
    });
  };

  const getResolvedSizeProps = () => {
    const isSm = size === 'small' || size === 'sm';
    const isMd = size === 'medium' || size === 'md';
    const isLg = size === 'large' || size === 'lg';
    const isHero = size === 'xlarge' || size === 'hero';
    const isSos = size === 'sos';

    let height = theme.buttonSizes.lg;
    let paddingHorizontal = 32;
    let radius = borderRadius.md;
    let fontSize = 18;
    let fontWeight: TextStyle['fontWeight'] = '700';

    if (isSm) {
      height = theme.buttonSizes.sm;
      paddingHorizontal = 16;
      radius = borderRadius.sm;
      fontSize = 14;
      fontWeight = '600';
    } else if (isMd) {
      height = theme.buttonSizes.md;
      paddingHorizontal = 24;
      radius = borderRadius.md;
      fontSize = 16;
      fontWeight = '600';
    } else if (isLg) {
      height = theme.buttonSizes.lg;
      paddingHorizontal = 32;
      radius = borderRadius.md;
      fontSize = 18;
      fontWeight = '700';
    } else if (isHero) {
      height = theme.buttonSizes.hero;
      paddingHorizontal = 48;
      radius = borderRadius.lg;
      fontSize = 18;
      fontWeight = '700';
    } else if (isSos) {
      height = theme.buttonSizes.sos;
      paddingHorizontal = 48;
      radius = borderRadius.xl;
      fontSize = 20;
      fontWeight = '800';
    }

    return { height, paddingHorizontal, borderRadius: radius, fontSize, fontWeight };
  };

  const resolvedSizeProps = getResolvedSizeProps();

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
      ...elevation.md,
      shadowColor: theme.colors.shadow,
    },
    secondary: {
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 0,
      ...elevation.md,
      shadowColor: theme.colors.shadow,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      shadowOpacity: 0,
      elevation: 0,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      shadowOpacity: 0,
      elevation: 0,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderWidth: 0,
      ...elevation.md,
      shadowColor: theme.colors.shadow,
    },
  };

  const textColors = {
    primary: theme.colors.textInverse,
    secondary: theme.colors.textInverse,
    outline: theme.colors.primary,
    ghost: theme.colors.primary,
    danger: theme.colors.textInverse,
  };

  const getButtonStyle = (): ViewStyle => {
    const isSolid = ['primary', 'secondary', 'danger'].includes(variant);

    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? theme.opacity.disabled : 1,
      height: resolvedSizeProps.height,
      paddingHorizontal: resolvedSizeProps.paddingHorizontal,
      borderRadius: resolvedSizeProps.borderRadius,
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      ...(disabled && isSolid ? { 
        backgroundColor: theme.colors.border,
        elevation: 0,
        shadowOpacity: 0,
      } : {}),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => ({
    color: textColors[variant],
    fontSize: resolvedSizeProps.fontSize,
    fontWeight: resolvedSizeProps.fontWeight,
    ...textStyle,
  });

  const handlePress = async () => {
    const hapticStyle =
      variant === 'danger'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light;

    await Haptics.impactAsync(hapticStyle).catch(() => {});
    onPress();
  };

  return (
    <Animated.View style={[{ width: fullWidth ? '100%' : undefined }, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={getButtonStyle()}
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          busy: loading,
        }}
        accessibilityLabel={title}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={textColors[variant]} 
            accessibilityLabel="Loading"
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon && (
              <View
                style={{
                  marginRight: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {icon}
              </View>
            )}
            <Text style={getTextStyle()}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
