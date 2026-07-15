import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color,
  text,
}) => {
  const { theme } = useTheme();

  const loaderColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, { padding: theme.spacing.md }]}>
      <ActivityIndicator size={size} color={loaderColor} />
      {text && (
        <Typography 
          variant="bodySmall" 
          color="secondary" 
          style={{ marginTop: theme.spacing.sm + 4 }}
          align="center"
        >
          {text}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
