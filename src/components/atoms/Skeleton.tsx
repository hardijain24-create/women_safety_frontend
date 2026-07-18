import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

export type SkeletonVariant = 'card' | 'avatar' | 'text' | 'list' | 'grid';

interface SkeletonProps {
  variant?: SkeletonVariant;
  height?: number;
  width?: ViewStyle['width'];
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'card',
  height,
  width,
  style,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 850 }),
        withTiming(0.35, { duration: 850 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isDark = theme.isDark;
  const shimmerBg = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';

  const getStyleForVariant = (): ViewStyle => {
    switch (variant) {
      case 'avatar':
        const avatarSize = height || 48;
        return {
          height: avatarSize,
          width: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: shimmerBg,
        };
      case 'text':
        return {
          height: height || 14,
          width: width || '80%',
          borderRadius: 4,
          backgroundColor: shimmerBg,
          marginVertical: 4,
        };
      case 'grid':
        return {
          height: height || 80,
          width: width || '48%',
          borderRadius: theme.card.radius - 4 || 12,
          backgroundColor: shimmerBg,
        };
      case 'card':
      default:
        return {
          height: height || 90,
          width: width || '100%',
          borderRadius: theme.card.radius - 4 || 12,
          backgroundColor: shimmerBg,
        };
    }
  };

  if (variant === 'list') {
    const listCount = 3;
    return (
      <View style={[styles.listContainer, style]}>
        {Array.from({ length: listCount }).map((_, i) => (
          <View key={i} style={styles.listItem}>
            {/* Avatar skeleton */}
            <Animated.View
              style={[
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: shimmerBg,
                  marginRight: 12,
                },
                animatedStyle,
              ]}
            />
            {/* Text skeleton lines */}
            <View style={{ flex: 1, gap: 6 }}>
              <Animated.View
                style={[
                  {
                    height: 14,
                    width: '60%',
                    borderRadius: 4,
                    backgroundColor: shimmerBg,
                  },
                  animatedStyle,
                ]}
              />
              <Animated.View
                style={[
                  {
                    height: 10,
                    width: '40%',
                    borderRadius: 4,
                    backgroundColor: shimmerBg,
                  },
                  animatedStyle,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        getStyleForVariant(),
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: '100%',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
});
