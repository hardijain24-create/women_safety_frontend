import React, { useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { 
   lightColors, 
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
   status, 
   layout, 
   hero,
   fontFamily
} from './colors';
import type { Theme } from '../types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const isDark = false;

  const theme: Theme = useMemo(() => ({
    colors: lightColors,
    spacing,
    typography,
    fontFamily,
    isDark,
    zIndex,
    opacity,
    iconSizes,
    avatarSizes,
    card,
    buttonSizes,
    animation,
    blur,
    gradients: lightGradients,
    status,
    layout,
    hero,
  }), []);

  const value = useMemo(() => ({
    theme,
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
