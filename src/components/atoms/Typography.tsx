import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'emergencyLarge' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'gold' | 'purple' | 'lilac' | 'error';
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
    emergencyLarge: { fontSize: theme.typography.size4xl + 12, fontWeight: '700', lineHeight: theme.typography.size4xl + 20 },
    h1: { fontSize: theme.typography.size3xl + 2, fontWeight: '600', lineHeight: theme.typography.size3xl + 10 },
    h2: { fontSize: theme.typography.size2xl, fontWeight: '600', lineHeight: theme.typography.size2xl + 8 },
    h3: { fontSize: theme.typography.sizeLg, fontWeight: '500', lineHeight: theme.typography.sizeLg + 8 },
    h4: { fontSize: theme.typography.sizeBase, fontWeight: '600', lineHeight: theme.typography.sizeBase + 6 },
    bodyLarge: { fontSize: theme.typography.sizeLg, fontWeight: '400', lineHeight: theme.typography.sizeLg + 8 },
    body: { fontSize: theme.typography.sizeBase, fontWeight: '400', lineHeight: theme.typography.sizeBase + 8 },
    bodySmall: { fontSize: theme.typography.sizeSm, fontWeight: '400', lineHeight: theme.typography.sizeSm + 6 },
    caption: { fontSize: theme.typography.sizeXs, fontWeight: '500', lineHeight: theme.typography.sizeXs + 4, letterSpacing: 0.2 },
    label: { fontSize: theme.typography.sizeSm, fontWeight: '600', lineHeight: theme.typography.sizeSm + 6, letterSpacing: 0.5 },
  };

  const colorStyles: Record<string, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    gold: theme.colors.primary,
    purple: theme.colors.primary,
    lilac: theme.colors.primary,
    error: theme.colors.error,
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
