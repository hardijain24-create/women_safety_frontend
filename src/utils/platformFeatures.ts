import { Platform } from 'react-native';

export const Features = {
  bluetooth: Platform.OS !== 'web',
  gps: true,
  notifications: Platform.OS !== 'web',
};
