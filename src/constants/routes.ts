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
  FAKE_CALL_INCOMING: 'FakeCallIncoming',
  FAKE_CALL_ACTIVE: 'FakeCallActive',
} as const;

export type RouteName = typeof ROUTES[keyof typeof ROUTES];
