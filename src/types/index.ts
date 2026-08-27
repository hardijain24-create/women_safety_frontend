export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorTheme {
  // Background colors
  background: string;
  backgroundSecondary: string;
  card: string;
  cardGlass: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Accent colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gold: string;
  goldLight: string;
  goldDark: string;
  
  // Navy colors (for navy theme)
  navy: string;
  navyLight: string;
  navyDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // UI colors
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  blurTint: 'light' | 'dark';
}

export interface SpacingTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface TypographyTheme {
  sizeXxs: number;
  sizeXs: number;
  sizeSm: number;
  sizeBase: number;
  sizeLg: number;
  sizeXl: number;
  size2xl: number;
  size3xl: number;
  size4xl: number;
}

export interface Theme {
  colors: ColorTheme;
  spacing: SpacingTheme;
  typography: TypographyTheme;
  isDark: boolean;
}

export interface DeviceStatus {
  isConnected: boolean;
  batteryLevel: number;
  signalStrength: number;
  lastSync: string;
  isCharging: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  accuracy: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
  isPrimary: boolean;
  avatar?: string;
}

export interface AlertItem {
  id: string;
  type: 'sos' | 'band_trigger' | 'check_in' | 'battery_low' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  emergencyMessage: string;
  autoCheckInEnabled: boolean;
  checkInInterval: number;
  vibrationEnabled: boolean;
  alarmEnabled: boolean;
  autoConnectBand: boolean;
}

export interface BandSettings {
  vibrationEnabled: boolean;
  alarmVolume: number;
  alarmEnabled: boolean;
  autoSync: boolean;
  syncInterval: number;
}
