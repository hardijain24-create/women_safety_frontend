import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface InfoTileProps {
  label: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'highlight' | 'danger';
}

export const InfoTile: React.FC<InfoTileProps> = ({
  label,
  value,
  icon,
  variant = 'default',
}) => {
  const { theme } = useTheme();

  const variantStyles = {
    default: {
      bg: theme.colors.card,
      border: theme.colors.border,
      iconColor: theme.colors.primary,
    },
    highlight: {
      bg: theme.colors.primary + '08',
      border: theme.colors.primary + '30',
      iconColor: theme.colors.primary,
    },
    danger: {
      bg: theme.colors.error + '08',
      border: theme.colors.error + '30',
      iconColor: theme.colors.error,
    },
  };

  const currentStyles = variantStyles[variant];

  return (
    <View 
      style={[
        styles.tile, 
        { 
          backgroundColor: currentStyles.bg, 
          borderColor: currentStyles.border 
        }
      ]}
    >
      <View style={styles.header}>
        <Typography variant="caption" color="muted" numberOfLines={1}>
          {label}
        </Typography>
        {icon && (
          <Icon 
            name={icon} 
            size={14} 
            color={currentStyles.iconColor} 
          />
        )}
      </View>
      <Typography 
        variant="body" 
        color={variant === 'danger' ? 'error' : 'primary'} 
        weight="700"
        style={styles.value}
      >
        {value}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  value: {
    marginTop: 2,
  },
});
