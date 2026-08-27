import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme';
import { Navigation } from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { ShakeSOSProvider } from './src/context/ShakeSOSContext';

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ShakeSOSProvider>
          <Navigation />
          <StatusBar style="auto" />
        </ShakeSOSProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

