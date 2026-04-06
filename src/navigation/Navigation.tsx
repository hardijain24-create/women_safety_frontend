import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';
import { Icon } from '../components/atoms/Icon';
import { ROUTES } from '../constants';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { LocationScreen } from '../screens/LocationScreen';
import { BandScreen } from '../screens/BandScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SOSScreen } from '../screens/SOSScreen';

// Types
export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
};

export type MainTabParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.LOCATION]: undefined;
  [ROUTES.BAND]: undefined;
  [ROUTES.CONTACTS]: undefined;
  [ROUTES.ALERTS]: undefined;
  [ROUTES.PROFILE]: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  [ROUTES.SOS]: undefined;
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

const AuthStackNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  const screenOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyle: { backgroundColor: theme.colors.background },
  };

  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  const screenOptions = ({ route }: { route: { name: string } }): BottomTabNavigationOptions => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.colors.card,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      height: 88,
      paddingBottom: 16,
      paddingTop: 12,
    },
    tabBarActiveTintColor: theme.colors.gold,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
      const iconMap: Record<string, string> = {
        [ROUTES.HOME]: 'home',
        [ROUTES.LOCATION]: 'location',
        [ROUTES.BAND]: 'band',
        [ROUTES.CONTACTS]: 'contacts',
        [ROUTES.ALERTS]: 'alerts',
        [ROUTES.PROFILE]: 'profile',
      };
      return <Icon name={iconMap[route.name] || 'home'} size={size} color={color} />;
    },
  });

  return (
    <MainTab.Navigator screenOptions={screenOptions}>
      <MainTab.Screen 
        name={ROUTES.HOME} 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name={ROUTES.LOCATION} 
        component={LocationScreen} 
        options={{ tabBarLabel: 'Location' }}
      />
      <MainTab.Screen 
        name={ROUTES.BAND} 
        component={BandScreen} 
        options={{ tabBarLabel: 'Band' }}
      />
      <MainTab.Screen 
        name={ROUTES.CONTACTS} 
        component={ContactsScreen} 
        options={{ tabBarLabel: 'Contacts' }}
      />
      <MainTab.Screen 
        name={ROUTES.ALERTS} 
        component={AlertsScreen} 
        options={{ tabBarLabel: 'Alerts' }}
      />
      <MainTab.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
};

export const Navigation: React.FC = () => {
  const { theme } = useTheme();

  const navigationTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.gold,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.gold,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        <RootStack.Screen name="Main" component={MainTabNavigator} />
        <RootStack.Screen 
          name={ROUTES.SOS} 
          component={SOSScreen}
          options={{ presentation: 'modal' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
