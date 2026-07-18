import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Card } from './Card';

export const BluetoothUnavailable: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Card variant="danger" padding="large" style={styles.card}>
      <View style={styles.header}>
        <Icon 
          name="alerts" 
          size={24} 
          color={theme.colors.error} 
          backgroundColor={theme.colors.error + '12'}
          containerStyle={{ marginRight: 12 }}
        />
        <Typography variant="bodyLarge" color="primary" weight="700" style={{ color: theme.colors.error, flex: 1 }}>
          Bluetooth isn't supported in the web version
        </Typography>
      </View>

      <Typography variant="bodySmall" color="secondary" style={{ marginTop: 12, fontWeight: '600' }}>
        To pair your Guardian Band:
      </Typography>

      <View style={styles.stepsContainer}>
        <View style={styles.stepRow}>
          <Typography variant="bodySmall" color="muted" style={styles.bullet}>•</Typography>
          <Typography variant="bodySmall" color="secondary" style={styles.stepText}>
            Install the native Android or iOS application.
          </Typography>
        </View>
        <View style={styles.stepRow}>
          <Typography variant="bodySmall" color="muted" style={styles.bullet}>•</Typography>
          <Typography variant="bodySmall" color="secondary" style={styles.stepText}>
            Ensure your mobile Bluetooth and GPS services are enabled.
          </Typography>
        </View>
        <View style={styles.stepRow}>
          <Typography variant="bodySmall" color="muted" style={styles.bullet}>•</Typography>
          <Typography variant="bodySmall" color="secondary" style={styles.stepText}>
            Open the <Typography variant="bodySmall" weight="600">My Device</Typography> screen on your phone.
          </Typography>
        </View>
        <View style={styles.stepRow}>
          <Typography variant="bodySmall" color="muted" style={styles.bullet}>•</Typography>
          <Typography variant="bodySmall" color="secondary" style={styles.stepText}>
            Tap <Typography variant="bodySmall" weight="600">Scan for Devices</Typography> to locate your band.
          </Typography>
        </View>
      </View>

      <Typography variant="caption" color="muted" style={styles.footerNote}>
        Note: The web console supports account configuration, alerts log history, and medical profile management only.
      </Typography>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsContainer: {
    marginTop: 8,
    paddingLeft: 4,
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginRight: 8,
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    lineHeight: 18,
  },
  footerNote: {
    marginTop: 16,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
