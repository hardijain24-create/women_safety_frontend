import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/theme';
import { Navigation } from './src/navigation';

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <Navigation />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
