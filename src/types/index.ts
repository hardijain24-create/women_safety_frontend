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
  textTertiary: string;
  textMuted: string;
  textInverse: string;
  
  // Accent colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
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
  errorDark: string;
  info: string;
  neutral: string;
  muted: string;
  
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

export interface ZIndexTheme {
  base: number;
  card: number;
  header: number;
  fab: number;
  overlay: number;
  modal: number;
  toast: number;
  sos: number;
}

export interface OpacityTheme {
  disabled: number;
  overlay: number;
  pressed: number;
  loading: number;
  subtle: number;
}

export interface IconSizesTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  hero: number;
  sos: number;
}

export interface AvatarSizesTheme {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface CardTheme {
  minHeight: number;
  radius: number;
  padding: number;
  gap: number;
}

export interface ButtonSizesTheme {
  sm: number;
  md: number;
  lg: number;
  hero: number;
  sos: number;
}

export interface AnimationSpringTheme {
  damping: number;
  stiffness: number;
}

export interface AnimationScaleTheme {
  in: { transform: { scale: number }[] };
  out: { transform: { scale: number }[] };
}

export interface AnimationTheme {
  fast: number;
  normal: number;
  slow: number;
  pulse: number;
  countdown: number;
  spring: AnimationSpringTheme;
  scale: AnimationScaleTheme;
}

export interface BlurTheme {
  light: number;
  medium: number;
  heavy: number;
}

export interface GradientsTheme {
  primary: string[];
  danger: string[];
  card: string[];
}

export interface StatusTheme {
  connected: string;
  connecting: string;
  offline: string;
  danger: string;
}

export interface LayoutTheme {
  screenPadding: number;
  sectionGap: number;
  cardGap: number;
  fabBottom: number;
}

export interface HeroTheme {
  sosButton: number;
  profile: number;
  header: number;
}

export interface FontFamilyTheme {
  heading: string;
  body: string;
}

export interface Theme {
  colors: ColorTheme;
  spacing: SpacingTheme;
  typography: TypographyTheme;
  fontFamily: FontFamilyTheme;
  isDark: boolean;
  zIndex: ZIndexTheme;
  opacity: OpacityTheme;
  iconSizes: IconSizesTheme;
  avatarSizes: AvatarSizesTheme;
  card: CardTheme;
  buttonSizes: ButtonSizesTheme;
  animation: AnimationTheme;
  blur: BlurTheme;
  gradients: GradientsTheme;
  status: StatusTheme;
  layout: LayoutTheme;
  hero: HeroTheme;
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
  status?: 'active' | 'resolved';
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
  safety_pin?: string;
  deactivation_pin?: string;
}


export interface BandSettings {
  vibrationEnabled: boolean;
  alarmVolume: number;
  alarmEnabled: boolean;
  autoSync: boolean;
  syncInterval: number;
}
