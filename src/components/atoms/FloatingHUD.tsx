import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Card } from '../molecules/Card';
import { useTheme } from '../../theme';

interface FloatingHUDProps {
  children: React.ReactNode;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  style?: ViewStyle;
}

export const FloatingHUD: React.FC<FloatingHUDProps> = ({
  children,
  top,
  bottom,
  left,
  right,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.hudContainer,
        {
          top: top !== undefined ? top : undefined,
          bottom: bottom !== undefined ? bottom : undefined,
          left: left !== undefined ? left : undefined,
          right: right !== undefined ? right : undefined,
        },
        style,
      ]}
    >
      <Card 
        variant="glass" 
        padding="small" 
        style={{
          ...styles.hudCard, 
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.primary + '20',
          borderWidth: 1,
          borderRadius: 20,
        }}
      >
        {children}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  hudCard: {
    borderRadius: 16,
    minHeight: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
