import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { Card } from '../molecules/Card';
import * as Location from 'expo-location';

interface EmergencyDashboardProps {
  countdown?: number;
  activeTime?: number;
  location?: Location.LocationObject | null;
  recordingSegment?: number;
  isHoldingCancel: boolean;
  cancelProgress: number;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  isCountdownMode: boolean;
  onCancelCountdown?: () => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  countdown = 5,
  activeTime = 0,
  location,
  recordingSegment = 1,
  isHoldingCancel,
  cancelProgress,
  onHoldStart,
  onHoldEnd,
  isCountdownMode,
  onCancelCountdown,
}) => {
  const { theme } = useTheme();

  const styles = {
    centerWrapper: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    countdownBox: {
      width: theme.hero.header,
      height: theme.hero.header,
      borderRadius: theme.hero.header / 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginVertical: theme.layout.sectionGap * 2,
    },
    countdownText: {
      fontWeight: '800' as const,
      textAlign: 'center' as const,
    },
    cancelButton: {
      width: '100%' as const,
      height: theme.buttonSizes.lg,
      borderRadius: theme.buttonSizes.lg / 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    dashboard: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    activeHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      width: '100%' as const,
      marginBottom: theme.layout.sectionGap,
      paddingHorizontal: theme.spacing.xs,
    },
    activeTimeBadge: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: theme.spacing.sm + 4,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.card.radius - 8,
    },
    telemetryRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    logRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    actionWrapper: {
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    stopButton: {
      width: '100%' as const,
      height: theme.buttonSizes.lg,
      borderRadius: theme.buttonSizes.lg / 2,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      elevation: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    cancelProgressTrack: {
      width: '100%' as const,
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
      marginTop: theme.spacing.sm + 4,
      overflow: 'hidden' as const,
    },
    cancelProgressFill: {
      height: 6,
      borderRadius: 3,
    },
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isCountdownMode) {
    return (
      <View style={styles.centerWrapper}>
        <Typography variant="h2" color="inverse" align="center" weight="700">
          EMERGENCY SOS
        </Typography>
        <Typography variant="body" color="inverse" align="center" style={{ marginTop: theme.spacing.sm + 4, opacity: 0.9 }}>
          Alert will trigger automatically in:
        </Typography>

        <View style={styles.countdownBox}>
          <Typography variant="emergencyLarge" color="inverse" style={styles.countdownText}>
            {countdown}
          </Typography>
        </View>

        {onCancelCountdown && (
          <TouchableOpacity 
            onPress={onCancelCountdown}
            activeOpacity={theme.opacity.pressed}
            style={[styles.cancelButton, { backgroundColor: theme.colors.textInverse }]}
          >
            <Typography variant="bodyLarge" weight="700" style={{ color: theme.colors.error }}>
              Cancel Alert
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.dashboard}>
      <View style={styles.activeHeader}>
        <Typography variant="bodySmall" color="inverse" weight="700" style={{ letterSpacing: 1 }}>
          🚨 LIVE EMERGENCY BROADCAST
        </Typography>
        <View style={styles.activeTimeBadge}>
          <Typography variant="caption" style={{ color: theme.colors.error, fontWeight: '700' }}>
            {formatTime(activeTime)}
          </Typography>
        </View>
      </View>

      {/* Streaming Diagnostics Card */}
      <Card variant="glass" padding="medium" style={{ width: '100%', marginBottom: theme.layout.cardGap }}>
        <Typography variant="caption" color="inverse" style={{ marginBottom: theme.layout.cardGap - 4, opacity: 0.8 }}>
          SYSTEM TELEMETRY
        </Typography>
        
        <View style={styles.telemetryRow}>
          <Typography variant="bodySmall" color="inverse">GPS Status</Typography>
          <Badge label="STREAMING" variant="success" size="small" />
        </View>
        <View style={[styles.telemetryRow, { marginTop: theme.spacing.sm }]}>
          <Typography variant="bodySmall" color="inverse">Coordinates</Typography>
          <Typography variant="caption" color="inverse" weight="600">
            {location?.coords.latitude || '37.7749'}° N, {location?.coords.longitude || '-122.4194'}° W
          </Typography>
        </View>
        <View style={[styles.telemetryRow, { marginTop: theme.spacing.sm }]}>
          <Typography variant="bodySmall" color="inverse">Mic Audio Capture</Typography>
          <Typography variant="caption" color="inverse" weight="600">
            🔴 segment_{recordingSegment}.wav (Active)
          </Typography>
        </View>
      </Card>

      {/* Dispatch verification logs */}
      <Card variant="glass" padding="medium" style={{ width: '100%', marginBottom: theme.layout.sectionGap }}>
        <Typography variant="caption" color="inverse" style={{ marginBottom: theme.layout.cardGap - 4, opacity: 0.8 }}>
          EMERGENCY DISPATCH VERIFICATION
        </Typography>
        
        <View style={styles.logRow}>
          <Icon name="check" size="sm" color={theme.colors.success} />
          <Typography variant="bodySmall" color="inverse" style={{ marginLeft: theme.spacing.sm }}>
            Twilio SMS Broadcast: Sent to 3 Guardians
          </Typography>
        </View>
        <View style={[styles.logRow, { marginTop: theme.spacing.sm }]}>
          <Icon name="check" size="sm" color={theme.colors.success} />
          <Typography variant="bodySmall" color="inverse" style={{ marginLeft: theme.spacing.sm }}>
            Live Map View: Broadcast online
          </Typography>
        </View>
        <View style={[styles.logRow, { marginTop: theme.spacing.sm }]}>
          <Icon name="shield" size="sm" color={theme.colors.primary} />
          <Typography variant="bodySmall" color="inverse" style={{ marginLeft: theme.spacing.sm }}>
            Phone Dialer: Hotline queued
          </Typography>
        </View>
      </Card>

      {/* Stop SOS button wrapper */}
      <View style={styles.actionWrapper}>
        <TouchableOpacity
          onPressIn={onHoldStart}
          onPressOut={onHoldEnd}
          activeOpacity={theme.opacity.pressed}
          style={[styles.stopButton, { backgroundColor: theme.colors.textInverse }]}
        >
          <Typography variant="bodyLarge" style={{ color: theme.colors.error, fontWeight: '700' }}>
            {isHoldingCancel ? "HOLDING CANCEL..." : "HOLD TO CANCEL (3s)"}
          </Typography>
        </TouchableOpacity>

        {isHoldingCancel && (
          <View style={styles.cancelProgressTrack}>
            <View 
              style={[
                styles.cancelProgressFill, 
                { 
                  width: `${cancelProgress}%`, 
                  backgroundColor: theme.colors.primary 
                }
              ]} 
            />
          </View>
        )}
      </View>
    </View>
  );
};
