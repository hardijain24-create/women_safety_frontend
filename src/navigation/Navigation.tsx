import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme';
import { Icon } from '../components/atoms/Icon';
import { ROUTES } from '../constants';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import { LoginScreen } from '../features/auth/LoginScreen';
import { RegisterScreen } from '../features/auth/RegisterScreen';


// Main Screens
import { HomeScreen } from '../features/home/HomeScreen';
import { LocationScreen } from '../screens/LocationScreen';
import { BandScreen } from '../features/device/BandScreen';
import { ContactsScreen } from '../features/contacts/ContactsScreen';
import { AlertsScreen } from '../features/alerts/AlertsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { SOSScreen } from '../features/sos/SOSScreen';



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

const customCardStyleInterpolator = ({ current, next }: any) => {
  const progress = current.progress;
  
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
    extrapolate: 'clamp',
  });

  const nextScale = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.97],
        extrapolate: 'clamp',
      })
    : 1;

  const nextOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.5],
        extrapolate: 'clamp',
      })
    : 1;

  return {
    cardStyle: {
      opacity: next ? nextOpacity : opacity,
      transform: [
        { translateY: next ? 0 : translateY },
        { scale: next ? nextScale : scale },
      ],
    },
  };
};

const fastTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: 200,
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: 200,
    },
  },
};

const transitionOptions: StackNavigationOptions = {
  transitionSpec: fastTransitionSpec,
  cardStyleInterpolator: customCardStyleInterpolator,
};

const AuthStackNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  const screenOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyle: { backgroundColor: theme.colors.background },
    ...transitionOptions,
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
    animation: 'fade',
    tabBarStyle: {
      backgroundColor: theme.colors.card,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      elevation: 0,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      height: 84,
      paddingBottom: 16,
      paddingTop: 12,
    },
    tabBarActiveTintColor: theme.colors.error,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
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
  const { userToken, isLoading } = useContext(AuthContext);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false, ...transitionOptions }}>
        {userToken == null ? (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabNavigator} />
            <RootStack.Screen 
              name={ROUTES.SOS} 
              component={SOSScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
