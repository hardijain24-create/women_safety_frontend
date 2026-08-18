import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import { ThemeProvider } from './src/theme';
import { Navigation } from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { BleProvider } from './src/context/BleContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { GlobalAlert } from './src/utils/alert';

// Register background tasks at module scope (must be imported before any component renders)
import './src/services/LocationTaskManager';

export default function App(): JSX.Element {
  const [fontsLoaded] = useFonts({
    'Manrope-Light': Manrope_300Light,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-Medium': Manrope_500Medium,
    'Manrope-SemiBold': Manrope_600SemiBold,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF7F2' }}>
            <ActivityIndicator size="large" color="#88B29E" />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <BleProvider>
            <ThemeProvider>
              <Navigation />
              <GlobalAlert />
              <StatusBar style="auto" />
            </ThemeProvider>
          </BleProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}



