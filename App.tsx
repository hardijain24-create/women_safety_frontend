import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme';
import { Navigation } from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Navigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
