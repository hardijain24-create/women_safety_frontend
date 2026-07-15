import type { ColorTheme, SpacingTheme, TypographyTheme } from '../types';

export const lightColors: ColorTheme = {
  // Background colors - Calming safety white/gray background (Apple Health inspired)
  background: '#F8FAF8',
  backgroundSecondary: '#F3F4F6',
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.9)',
  
  // Text colors - High contrast charcoal text
  textPrimary: '#1B1B1B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Accent colors - Calming green
  primary: '#17C964',
  primaryLight: '#5CE27F',
  primaryDark: '#12A150',
  secondary: '#5CE27F',
  gold: '#17C964',       // Aliased to primary safety green to prevent import breakage
  goldLight: '#5CE27F',  // Aliased to primary light green
  goldDark: '#12A150',   // Aliased to primary dark green
  
  // Navy colors - Aliased to keep compatibilities
  navy: '#1B1B1B',
  navyLight: '#6B7280',
  navyDark: '#0F0F0F',
  
  // Status colors - Calming safety/health color mappings
  success: '#2ECC71',
  warning: '#F5B942',
  error: '#FF4D5A',      // High-intensity emergency red
  info: '#6B7280',
  neutral: '#E5E7EB',
  muted: '#9CA3AF',
  
  // UI colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: 'rgba(23, 201, 100, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  blurTint: 'light',
};

export const darkColors: ColorTheme = {
  // Background colors - Deep dark safety forest-black background
  background: '#0E110F',
  backgroundSecondary: '#161B18',
  card: '#161B18',
  cardGlass: 'rgba(22, 27, 24, 0.9)',
  
  // Text colors
  textPrimary: '#F5F5F5',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0E110F',
  
  // Accent colors
  primary: '#17C964',
  primaryLight: '#5CE27F',
  primaryDark: '#12A150',
  secondary: '#5CE27F',
  gold: '#17C964',       // Aliased
  goldLight: '#5CE27F',  // Aliased
  goldDark: '#12A150',   // Aliased
  
  // Navy colors - Aliased
  navy: '#F5F5F5',
  navyLight: '#9CA3AF',
  navyDark: '#161B18',
  
  // Status colors
  success: '#2ECC71',
  warning: '#E09A24',
  error: '#FF4D5A',
  info: '#9CA3AF',
  neutral: '#2D3748',
  muted: '#6B7280',
  
  // UI colors
  border: '#2D3748',
  borderLight: '#1F2937',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.75)',
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
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
  full: 9999,
};

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  pulse: 1200,
  countdown: 3000,
  spring: {
    damping: 18,
    stiffness: 180,
  },
  scale: {
    in: { transform: [{ scale: 0.95 }] },
    out: { transform: [{ scale: 1 }] },
  },
};

export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const zIndex = {
  base: 0,
  card: 5,
  header: 20,
  fab: 50,
  overlay: 80,
  modal: 90,
  toast: 100,
  sos: 999,
};

export const opacity = {
  disabled: 0.45,
  overlay: 0.5,
  pressed: 0.8,
  loading: 0.65,
  subtle: 0.12,
};

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  hero: 48,
  sos: 72,
};

export const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

export const card = {
  minHeight: 88,
  radius: 20,
  padding: 20,
  gap: 16,
};

export const buttonSizes = {
  sm: 40,
  md: 48,
  lg: 56,
  hero: 64,
  sos: 96,
};

export const blur = {
  light: 20,
  medium: 40,
  heavy: 60,
};

export const lightGradients = {
  primary: ['#17C964', '#5CE27F'],
  danger: ['#FF4D5A', '#FF7B85'],
  card: ['#FFFFFF', '#F8FAF8'],
};

export const darkGradients = {
  primary: ['#17C964', '#5CE27F'],
  danger: ['#FF4D5A', '#FF7B85'],
  card: ['#161B18', '#0E110F'],
};

export const status = {
  connected: '#17C964',
  connecting: '#F5B942',
  offline: '#9CA3AF',
  danger: '#FF4D5A',
};

export const layout = {
  screenPadding: 20,
  sectionGap: 24,
  cardGap: 16,
  fabBottom: 32,
};

export const hero = {
  sosButton: 180,
  profile: 96,
  header: 140,
};

