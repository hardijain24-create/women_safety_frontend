import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card } from './Card';

interface PermissionCardProps {
  title: string;
  description: string;
  icon: string;
  status: 'granted' | 'denied' | 'requesting';
  onRequest: () => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({
  title,
  description,
  icon,
  status,
  onRequest,
}) => {
  const { theme } = useTheme();

  const isGranted = status === 'granted';

  return (
    <Card 
      variant={isGranted ? "default" : "danger"} 
      padding="medium" 
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          <Icon
            name={icon}
            size={22}
            color={isGranted ? theme.colors.primary : theme.colors.error}
            backgroundColor={isGranted ? theme.colors.primary + '12' : theme.colors.error + '10'}
            containerStyle={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Typography variant="body" color="primary" weight="600">
              {title}
            </Typography>
            <Typography variant="caption" color="muted" style={{ marginTop: 2 }}>
              {description}
            </Typography>
          </View>
        </View>

        <Badge
          label={isGranted ? 'Authorized' : status === 'requesting' ? 'Required' : 'Denied'}
          variant={isGranted ? 'success' : status === 'requesting' ? 'warning' : 'error'}
          size="small"
        />
      </View>

      {!isGranted && (
        <Button
          title={status === 'requesting' ? "Allow Access" : "Grant Authorization"}
          onPress={onRequest}
          variant="primary"
          size="small"
          style={styles.button}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
});
