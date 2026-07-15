import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { 
  Home, 
  Compass, 
  Watch, 
  Users, 
  AlertTriangle, 
  User, 
  ShieldAlert, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Menu, 
  Settings, 
  Battery, 
  BatteryMedium, 
  BatteryWarning, 
  Wifi, 
  Activity, 
  MapPin, 
  Phone, 
  Mail, 
  Bell, 
  Volume2, 
  Moon, 
  Sun, 
  Shield, 
  Heart, 
  Star, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Search,
  HelpCircle
} from 'lucide-react-native';

interface IconProps {
  name: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'sos';
  color?: string;
  backgroundColor?: string;
  containerStyle?: ViewStyle;
}

const lucideMap: Record<string, React.ComponentType<any>> = {
  'home': Home,
  'location': Compass,
  'band': Watch,
  'contacts': Users,
  'alerts': AlertTriangle,
  'profile': User,
  'sos': ShieldAlert,
  'check': Check,
  'add': Plus,
  'delete': Trash2,
  'edit': Edit3,
  'arrow-right': ChevronRight,
  'arrow-left': ChevronLeft,
  'arrow-up': ChevronUp,
  'arrow-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'close': X,
  'menu': Menu,
  'settings': Settings,
  'battery-full': Battery,
  'battery-half': BatteryMedium,
  'battery-low': BatteryWarning,
  'wifi': Wifi,
  'signal': Activity,
  'location-pin': MapPin,
  'phone': Phone,
  'email': Mail,
  'bell': Bell,
  'vibrate': Activity,
  'volume': Volume2,
  'moon': Moon,
  'sun': Sun,
  'shield': Shield,
  'heart': Heart,
  'star': Star,
  'eye': Eye,
  'eye-off': EyeOff,
  'message': MessageSquare,
  'search': Search,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  backgroundColor,
  containerStyle,
}) => {
  const { theme } = useTheme();

  const resolvedSize = typeof size === 'number'
    ? size
    : theme.iconSizes[size] || theme.iconSizes.md;

  const defaultColor = color || theme.colors.textPrimary;
  const bgColor = backgroundColor || 'transparent';

  const wrapperStyle: ViewStyle = {
    width: resolvedSize * 1.5,
    height: resolvedSize * 1.5,
    borderRadius: (resolvedSize * 1.5) / 2,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...containerStyle,
  };

  const LucideIcon = lucideMap[name] || HelpCircle;

  return (
    <View style={wrapperStyle}>
      <LucideIcon size={resolvedSize} color={defaultColor} />
    </View>
  );
};
