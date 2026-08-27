import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'gold' | 'purple' | 'lilac';
  align?: 'left' | 'center' | 'right';
  weight?: '400' | '500' | '600' | '700';
  style?: TextStyle;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  numberOfLines,
}) => {
  const { theme } = useTheme();

  const variantStyles: Record<string, TextStyle> = {
    h1: { fontSize: 36, fontWeight: '700', lineHeight: 44 },
    h2: { fontSize: 30, fontWeight: '700', lineHeight: 38 },
    h3: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
    label: { fontSize: 14, fontWeight: '600', lineHeight: 20, letterSpacing: 0.5 },
  };

  const colorStyles: Record<string, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    gold: theme.colors.gold,
    purple: theme.colors.gold,
    lilac: theme.colors.gold,
  };

  const textStyle: TextStyle = {
    ...variantStyles[variant],
    color: colorStyles[color],
    textAlign: align,
    ...(weight && { fontWeight: weight }),
    ...style,
  };

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};
