import type { ColorTheme, SpacingTheme, TypographyTheme } from '../types';

export const lightColors: ColorTheme = {
  // Background colors - Warm cream/off-white background (Apple Health inspired)
  background: '#FAF9F7',
  backgroundSecondary: '#F3F2EE',
  card: '#FFFFFF',
  cardGlass: 'rgba(255, 255, 255, 0.95)',
  
  // Text colors - High contrast charcoal text
  textPrimary: '#1B1B1B',
  textSecondary: '#4B5563',
  textTertiary: '#6B7280',
  textMuted: '#A39E98',
  textInverse: '#FFFFFF',
  
  // Accent colors - Calm warm elements
  primary: '#2D7B57',    // Desaturated green for safety status
  primaryLight: '#EEF6F2',
  primaryDark: '#20583E',
  secondary: '#95A59E',
  gold: '#2D7B57',
  goldLight: '#EEF6F2',
  goldDark: '#20583E',
  
  // Navy colors
  navy: '#1B1B1B',
  navyLight: '#45413D',
  navyDark: '#0F0F0F',
  
  // Status colors - Confident emergency coral & safety green
  success: '#2D7B57',    // Desaturated green
  warning: '#E3BAA0',
  error: '#E48981',      // Warm coral/salmon for SOS/danger
  errorDark: '#BE716A',  // Deeper coral for borders/active-states
  info: '#45413D',
  neutral: '#E5E7EB',
  muted: '#A39E98',
  
  // UI colors
  border: '#EBE6DF',
  borderLight: '#F5F0E8',
  shadow: 'rgba(92, 88, 84, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  blurTint: 'light',
};

export const darkColors: ColorTheme = {
  // Background colors - Warm dark charcoal
  background: '#1A1816',
  backgroundSecondary: '#252220',
  card: '#252220',
  cardGlass: 'rgba(37, 34, 32, 0.95)',
  
  // Text colors
  textPrimary: '#F5F5F5',
  textSecondary: '#D8E0DC',
  textTertiary: '#B8C2BC',
  textMuted: '#5C5854',
  textInverse: '#1A1816',
  
  // Accent colors
  primary: '#278258',
  primaryLight: '#263B30',
  primaryDark: '#195F40',
  secondary: '#91AEA0',
  gold: '#278258',
  goldLight: '#263B30',
  goldDark: '#195F40',
  
  // Navy colors
  navy: '#F5F5F5',
  navyLight: '#E1DDD7',
  navyDark: '#1A1816',
  
  // Status colors
  success: '#278258',
  warning: '#E5B597',
  error: '#E78279',
  errorDark: '#C16860',
  info: '#A39E98',
  neutral: '#2D3748',
  muted: '#5C5854',
  
  // UI colors
  border: '#36322F',
  borderLight: '#2A2724',
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
  size3xl: 28,
  size4xl: 34,
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
  md: 18,
  lg: 18,
  xl: 20,
  '2xl': 24,
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
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
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
  radius: 18,
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
  primary: ['#88B29E', '#A5C7B4'],
  danger: ['#EE8B83', '#C9625A'],
  card: ['#FFFFFF', '#FBF9F6'],
};

export const darkGradients = {
  primary: ['#88B29E', '#A5C7B4'],
  danger: ['#EE8B83', '#C9625A'],
  card: ['#221E1C', '#161413'],
};

export const status = {
  connected: '#88B29E',
  connecting: '#EAA87E',
  offline: '#9CA3AF',
  danger: '#EE8B83',
};

export const layout = {
  screenPadding: 20,
  sectionGap: 20,
  cardGap: 16,
  fabBottom: 32,
};

export const hero = {
  sosButton: 180,
  profile: 96,
  header: 140,
};

export const fontFamily = {
  heading: 'Manrope-Medium',
  body: 'Manrope-Regular',
};

