export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Main Tabs
  HOME: 'Home',
  LOCATION: 'Location',
  BAND: 'Band',
  CONTACTS: 'Contacts',
  ALERTS: 'Alerts',
  PROFILE: 'Profile',
  
  // Other Screens
  SOS: 'SOS',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
