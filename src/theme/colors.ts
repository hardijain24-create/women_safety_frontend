import type { ColorTheme, SpacingTheme, TypographyTheme } from '../types';

export const lightColors: ColorTheme = {
  // Background colors - Better contrast for visibility
  background: '#1A1F2E',
  backgroundSecondary: '#242B3D',
  card: '#FAFAFA',
  cardGlass: 'rgba(250, 250, 250, 0.9)',
  
  // Text colors - Black for visibility on light background
  textPrimary: '#1A1F2E',
  textSecondary: '#2D3748',
  textMuted: '#4A5568',
  textInverse: '#FAFAFA',
  
  // Accent colors - Beautiful lilac instead of purple
  primary: '#1A1F2E',
  primaryLight: '#2D3748',
  primaryDark: '#1A202C',
  gold: '#C8A2C8',
  goldLight: '#D8BFD8',
  goldDark: '#BA8FBA',
  
  // Navy colors (now used as accents)
  navy: '#1A1F2E',
  navyLight: '#2D3748',
  navyDark: '#1A202C',
  
  // Status colors - enhanced with cooler tones
  success: '#4A9D6F',
  warning: '#D4A574',
  error: '#8B2635',
  info: '#5B8FA3',
  
  // UI colors - enhanced glassmorphism with better contrast
  border: 'rgba(26, 31, 46, 0.2)',
  borderLight: 'rgba(26, 31, 46, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.25)',
  overlay: 'rgba(26, 31, 46, 0.7)',
  blurTint: 'light',
};

export const darkColors: ColorTheme = {
  // Background colors - Deeper dark navy with beige accents
  background: '#0D1117',
  backgroundSecondary: '#161B22',
  card: '#1A1F2E',
  cardGlass: 'rgba(26, 31, 46, 0.9)',
  
  // Text colors
  textPrimary: '#F5F1E8',
  textSecondary: '#E8E0D0',
  textMuted: '#B8B0A0',
  textInverse: '#0D1117',
  
  // Accent colors - Beautiful lilac for dark theme
  primary: '#F5F1E8',
  primaryLight: '#FAF8F3',
  primaryDark: '#E8E0D0',
  gold: '#D8BFD8',
  goldLight: '#E6D8E6',
  goldDark: '#C8A2C8',
  
  // Navy colors (now used as accents)
  navy: '#F5F1E8',
  navyLight: '#FAF8F3',
  navyDark: '#E8E0D0',
  
  // Status colors - enhanced for dark mode with cooler tones
  success: '#4A9D6F',
  warning: '#D4A574',
  error: '#8B2635',
  info: '#5B8FA3',
  
  // UI colors - enhanced glassmorphism for dark mode
  border: 'rgba(245, 241, 232, 0.15)',
  borderLight: 'rgba(245, 241, 232, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(15, 22, 32, 0.8)',
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

// For touch targets suitable for all ages
export const touchTargets = {
  small: 40,
  medium: 48,
  large: 56,
  xlarge: 64,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
  full: 9999,
};
