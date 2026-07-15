import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showText?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  color,
  showText = true,
}) => {
  const { theme } = useTheme();

  const activeColor = color || theme.colors.primary;
  const trackColor = theme.colors.borderLight;

  const radius = size / 2;
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Render a clean circular border representation
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer track ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />

      {/* Segment Indicator Overlay */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: strokeWidth,
          borderColor: activeColor,
          // Fade opacity based on progress to simulate loading fullness
          opacity: normalizedProgress / 100,
        }}
      />

      {showText && (
        <View style={styles.textContainer}>
          <Typography 
            variant="caption" 
            weight="700" 
            style={{ color: activeColor }}
          >
            {Math.round(normalizedProgress)}%
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
