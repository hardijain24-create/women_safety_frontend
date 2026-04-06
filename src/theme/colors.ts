import type { ColorTheme, SpacingTheme, TypographyTheme } from '../types';

export const lightColors: ColorTheme = {
  // Background colors - Navy + Beige theme
  background: '#F5F1E8',
  backgroundSecondary: '#E8E0D0',
  card: '#FAF8F3',
  cardGlass: 'rgba(250, 248, 243, 0.85)',
  
  // Text colors
  textPrimary: '#1F2A44',
  textSecondary: '#4A5D73',
  textMuted: '#6E6E6E',
  textInverse: '#FAF8F3',
  
  // Accent colors
  primary: '#1F2A44',
  primaryLight: '#2A3A5C',
  primaryDark: '#151B2B',
  gold: '#D4AF37',
  goldLight: '#E5C76B',
  goldDark: '#B89628',
  
  // Navy colors
  navy: '#1F2A44',
  navyLight: '#2A3A5C',
  navyDark: '#151B2B',
  
  // Status colors
  success: '#8FAF9A',
  warning: '#E5A853',
  error: '#D95C5C',
  info: '#4A5D73',
  
  // UI colors
  border: 'rgba(31, 42, 68, 0.12)',
  borderLight: 'rgba(31, 42, 68, 0.06)',
  shadow: 'rgba(31, 42, 68, 0.12)',
  overlay: 'rgba(31, 42, 68, 0.5)',
  blurTint: 'light',
};

export const darkColors: ColorTheme = {
  // Background colors - Charcoal + Soft Gold accents
  background: '#1A1A1A',
  backgroundSecondary: '#2D2D2D',
  card: '#252525',
  cardGlass: 'rgba(37, 37, 37, 0.85)',
  
  // Text colors
  textPrimary: '#FAF8F3',
  textSecondary: '#B8B0A0',
  textMuted: '#8A8275',
  textInverse: '#1A1A1A',
  
  // Accent colors
  primary: '#2A3A5C',
  primaryLight: '#3A4A6C',
  primaryDark: '#1A2438',
  gold: '#E5C76B',
  goldLight: '#F0DCA0',
  goldDark: '#C9A227',
  
  // Navy colors
  navy: '#2A3A5C',
  navyLight: '#3A4A6C',
  navyDark: '#1A2438',
  
  // Status colors
  success: '#8FAF9A',
  warning: '#E5A853',
  error: '#E87A7A',
  info: '#5D7388',
  
  // UI colors
  border: 'rgba(250, 248, 243, 0.12)',
  borderLight: 'rgba(250, 248, 243, 0.06)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  blurTint: 'dark',
};

export const spacing: SpacingTheme = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography: TypographyTheme = {
  sizeXxs: 10,
  sizeXs: 12,
  sizeSm: 14,
  sizeBase: 16,
  sizeLg: 18,
  sizeXl: 20,
  size2xl: 24,
  size3xl: 30,
  size4xl: 36,
};

// For large touch targets suitable for 60+ users
export const touchTargets = {
  small: 44,
  medium: 56,
  large: 72,
  xlarge: 88,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};
