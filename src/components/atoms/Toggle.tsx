import React from 'react';
import { Switch, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from './Typography';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const sizes = {
    small: { transform: [{ scale: 0.8 }] },
    medium: { transform: [{ scale: 1 }] },
    large: { transform: [{ scale: 1.2 }] },
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {label && (
        <Typography
          variant="body"
          color="primary"
          style={{ marginRight: 12, flex: 1 }}
        >
          {label}
        </Typography>
      )}
      <View style={sizes[size]}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.gold + '80',
          }}
          thumbColor={value ? theme.colors.gold : theme.colors.textMuted}
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    </View>
  );
};
