import React, { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';
import { 
  lightColors, 
  darkColors, 
  spacing, 
  typography, 
  zIndex, 
  opacity, 
  iconSizes, 
  avatarSizes, 
  card, 
  buttonSizes, 
  animation, 
  blur, 
  lightGradients, 
  darkGradients, 
  status, 
  layout, 
  hero 
} from './colors';
import type { Theme, ThemeMode } from '../types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const theme: Theme = useMemo(() => ({
    colors: isDark ? darkColors : lightColors,
    spacing,
    typography,
    isDark,
    zIndex,
    opacity,
    iconSizes,
    avatarSizes,
    card,
    buttonSizes,
    animation,
    blur,
    gradients: isDark ? darkGradients : lightGradients,
    status,
    layout,
    hero,
  }), [isDark]);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return systemColorScheme === 'dark' ? 'light' : 'dark';
    });
  }, [systemColorScheme]);

  const value = useMemo(() => ({
    theme,
    mode,
    setMode,
    toggleTheme,
  }), [theme, mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
