import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  containerStyle?: ViewStyle;
}

// Simple icon component using text-based icons for cross-platform compatibility
const iconMap: Record<string, string> = {
  'home': '\u2302',
  'location': '\u2726',
  'band': '\u2311',
  'contacts': '\u263A',
  'alerts': '\u26A0',
  'profile': '\u263B',
  'sos': '\u2718',
  'check': '\u2713',
  'add': '+',
  'delete': '\u2715',
  'edit': '\u270E',
  'arrow-right': '>',
  'arrow-left': '<',
  'arrow-up': '^',
  'arrow-down': 'v',
  'close': '\u2715',
  'menu': '\u2630',
  'settings': '\u2699',
  'battery-full': '\u2588',
  'battery-half': '\u2584',
  'battery-low': '\u2581',
  'wifi': '\u2606',
  'signal': '\u221E',
  'location-pin': '\u25CF',
  'phone': '\u260E',
  'email': '@',
  'bell': '\u266A',
  'vibrate': '\u2234',
  'volume': '\u25D9',
  'moon': '\u263D',
  'sun': '\u2600',
  'shield': '\u262D',
  'heart': '\u2665',
  'star': '\u2605',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  backgroundColor,
  containerStyle,
}) => {
  const { theme } = useTheme();

  const defaultColor = color || theme.colors.textPrimary;
  const bgColor = backgroundColor || 'transparent';

  const wrapperStyle: ViewStyle = {
    width: size * 1.5,
    height: size * 1.5,
    borderRadius: (size * 1.5) / 2,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...containerStyle,
  };

  const textStyle = {
    fontSize: size,
    color: defaultColor,
    fontWeight: '600' as const,
    lineHeight: size * 1.2,
  };

  return (
    <View style={wrapperStyle}>
      <View style={textStyle}>
        {iconMap[name] || '?'}
      </View>
    </View>
  );
};
