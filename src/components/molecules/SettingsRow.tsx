import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

interface SettingsRowProps {
  label: string;
  description?: string;
  icon?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  noBorder?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  icon,
  onPress,
  rightComponent,
  noBorder = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={theme.colors.primary}
            backgroundColor={theme.colors.primary + '12'}
            containerStyle={{ marginRight: 14 }}
          />
        )}
        <View style={styles.textContainer}>
          <Typography variant="body" color="primary" weight="600">
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
              {description}
            </Typography>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? (
          rightComponent
        ) : onPress ? (
          <Icon name="arrow-right" size={16} color={theme.colors.textMuted} />
        ) : null}
      </View>
    </View>
  );

  const borderStyle = {
    borderBottomWidth: noBorder ? 0 : 0.5,
    borderBottomColor: theme.colors.borderLight,
  };

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7} 
        style={[styles.row, borderStyle]}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.row, borderStyle]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
