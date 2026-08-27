import type { DeviceStatus, LocationData, EmergencyContact, AlertItem, UserProfile } from '../types';

export const mockDeviceStatus: DeviceStatus = {
  isConnected: true,
  batteryLevel: 78,
  signalStrength: 85,
  lastSync: '2 min ago',
  isCharging: false,
};

export const mockLocation: LocationData = {
  latitude: 40.7128,
  longitude: -74.0060,
  address: '123 Main Street, New York, NY 10001',
  timestamp: new Date().toISOString(),
  accuracy: 4.5,
};

export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@email.com',
    relation: 'Daughter',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Michael Johnson',
    phone: '+1 (555) 987-6543',
    email: 'mike.j@email.com',
    relation: 'Son',
    isPrimary: false,
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    phone: '+1 (555) 246-8135',
    email: 'dr.chen@medical.com',
    relation: 'Doctor',
    isPrimary: false,
  },
  {
    id: '4',
    name: 'Margaret Wilson',
    phone: '+1 (555) 369-7410',
    email: 'maggie.w@email.com',
    relation: 'Sister',
    isPrimary: false,
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'sos',
    title: 'SOS Alert Sent',
    message: 'Emergency alert triggered from your location',
    timestamp: 'Today, 2:30 PM',
    isRead: true,
    severity: 'critical',
  },
  {
    id: '2',
    type: 'check_in',
    title: 'Daily Check-in Complete',
    message: 'You confirmed you are safe',
    timestamp: 'Yesterday, 9:00 AM',
    isRead: true,
    severity: 'low',
  },
  {
    id: '3',
    type: 'band_trigger',
    title: 'Band Button Pressed',
    message: 'Emergency button pressed on your band',
    timestamp: 'Yesterday, 3:15 PM',
    isRead: false,
    severity: 'high',
  },
  {
    id: '4',
    type: 'battery_low',
    title: 'Band Battery Low',
    message: 'Your band battery is at 15%',
    timestamp: '2 days ago, 8:00 PM',
    isRead: true,
    severity: 'medium',
  },
  {
    id: '5',
    type: 'system',
    title: 'App Updated',
    message: 'Guardian Band app updated to version 1.2.0',
    timestamp: '3 days ago',
    isRead: true,
    severity: 'low',
  },
];

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Elizabeth Johnson',
  email: 'elizabeth.j@email.com',
  phone: '+1 (555) 111-2222',
  avatar: undefined,
  dateOfBirth: '1955-03-15',
  emergencyMessage: 'This is an emergency alert from Elizabeth. Please help!',
  autoCheckInEnabled: true,
  checkInInterval: 24, // hours
  vibrationEnabled: true,
  alarmEnabled: true,
  autoConnectBand: true,
};
