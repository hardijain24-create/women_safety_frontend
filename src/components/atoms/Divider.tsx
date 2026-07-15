import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface DividerProps {
  margin?: 'none' | 'small' | 'medium' | 'large' | number;
  vertical?: boolean;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({
  margin = 'medium',
  vertical = false,
  color,
}) => {
  const { theme } = useTheme();

  const getMargin = () => {
    if (typeof margin === 'number') return margin;
    const margins = { none: 0, small: 8, medium: 16, large: 24 };
    return margins[margin];
  };

  const spacing = getMargin();
  const dividerColor = color || theme.colors.borderLight;

  const style: ViewStyle = vertical ? {
    width: 1.5,
    height: '100%',
    backgroundColor: dividerColor,
    marginHorizontal: spacing,
  } : {
    height: 1.5,
    width: '100%',
    backgroundColor: dividerColor,
    marginVertical: spacing,
  };

  return <View style={style} />;
};
