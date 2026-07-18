import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Button } from '../atoms/Button';

interface HeroSOSButtonProps {
  onPress: () => void;
  size?: number;
  pulseColor?: string;
  style?: ViewStyle;
}

export const HeroSOSButton: React.FC<HeroSOSButtonProps> = ({
  onPress,
  size = 180,
  pulseColor,
  style,
}) => {
  const { theme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  const activePulseColor = pulseColor || theme.colors.primary;

  // Reanimated values for breathing pulse rings
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.4);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.4);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      ring1Scale.value = 1.0;
      ring1Opacity.value = 0;
      ring2Scale.value = 1.0;
      ring2Opacity.value = 0;
      return;
    }

    // Pulse Ring 1 Loop
    ring1Scale.value = withRepeat(
      withTiming(1.6, { duration: 3000 }),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withTiming(0, { duration: 3000 }),
      -1,
      false
    );

    // Pulse Ring 2 Loop (1.5s offset)
    const timeout = setTimeout(() => {
      ring2Scale.value = withRepeat(
        withTiming(1.6, { duration: 3000 }),
        -1,
        false
      );
      ring2Opacity.value = withRepeat(
        withTiming(0, { duration: 3000 }),
        -1,
        false
      );
    }, 1500);

    return () => clearTimeout(timeout);
  }, [ring1Scale, ring1Opacity, ring2Scale, ring2Opacity, reduceMotion]);

  // Animated styles for breathing pulse rings
  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  return (
    <View style={[styles.sosContainer, style]}>
      {/* Breathing Pulse Ring 1 */}
      <Animated.View 
        style={[
          styles.pulseRing, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            backgroundColor: activePulseColor 
          }, 
          ringStyle1
        ]} 
      />
      {/* Breathing Pulse Ring 2 */}
      <Animated.View 
        style={[
          styles.pulseRing, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            backgroundColor: activePulseColor 
          }, 
          ringStyle2
        ]} 
      />
      
      {/* Main Central circular SOS Button */}
      <Button
        title="SOS"
        onPress={onPress}
        variant="primary"
        size="sos"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        }}
        textStyle={{
          fontSize: theme.typography.size4xl + 12,
          fontWeight: '800',
          color: theme.colors.textInverse,
        }}
        // Passing custom touch behaviors to animate container
        pulse={false} // Managed by our rings
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
  },
});
