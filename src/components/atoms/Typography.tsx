import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'emergencyLarge' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'gold' | 'purple' | 'lilac' | 'error';
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
    emergencyLarge: { fontSize: theme.typography.size4xl + 12, fontWeight: '600', lineHeight: theme.typography.size4xl + 22, letterSpacing: -0.5 },
    h1: { fontSize: theme.typography.size3xl + 2, fontWeight: '500', lineHeight: theme.typography.size3xl + 12, letterSpacing: -0.3 },
    h2: { fontSize: theme.typography.size2xl, fontWeight: '500', lineHeight: theme.typography.size2xl + 10, letterSpacing: -0.2 },
    h3: { fontSize: theme.typography.sizeLg + 2, fontWeight: '500', lineHeight: theme.typography.sizeLg + 10, letterSpacing: -0.1 },
    h4: { fontSize: theme.typography.sizeBase + 2, fontWeight: '500', lineHeight: theme.typography.sizeBase + 8 },
    bodyLarge: { fontSize: theme.typography.sizeLg, fontWeight: '400', lineHeight: theme.typography.sizeLg + 8 },
    body: { fontSize: theme.typography.sizeBase, fontWeight: '400', lineHeight: theme.typography.sizeBase + 8 },
    bodySmall: { fontSize: theme.typography.sizeSm, fontWeight: '400', lineHeight: theme.typography.sizeSm + 6 },
    caption: { fontSize: theme.typography.sizeXs, fontWeight: '500', lineHeight: theme.typography.sizeXs + 4, letterSpacing: 0.2 },
    label: { fontSize: theme.typography.sizeSm, fontWeight: '500', lineHeight: theme.typography.sizeSm + 6, letterSpacing: 0.5 },
  };

  const colorStyles: Record<string, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    gold: theme.colors.primary,
    purple: theme.colors.primary,
    lilac: theme.colors.primary,
    error: theme.colors.error,
  };

  const resolvedWeight = weight || variantStyles[variant].fontWeight || '400';
  const fontFamilies: Record<string, string> = {
    '400': 'Manrope-Regular',
    '500': 'Manrope-Medium',
    '600': 'Manrope-SemiBold',
    '700': 'Manrope-Bold',
  };
  const resolvedFontFamily = fontFamilies[resolvedWeight] || 'Manrope-Regular';

  const textStyle: TextStyle = {
    ...variantStyles[variant],
    fontFamily: resolvedFontFamily,
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
