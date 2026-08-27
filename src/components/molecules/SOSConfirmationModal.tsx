import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Vibration,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { useTheme } from '../../theme';
import { SOSState } from '../../services/shake/types';

export interface SOSConfirmationModalProps {
  visible: boolean;
  remainingSeconds: number;
  state: SOSState;
  onCancel: () => void;
}

export const SOSConfirmationModal: React.FC<SOSConfirmationModalProps> = ({
  visible,
  remainingSeconds,
  state,
  onCancel,
}) => {
  const { theme } = useTheme();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const numberScale = useRef(new Animated.Value(1.3)).current;

  // Pulse animation loop
  useEffect(() => {
    if (visible) {
      // Haptic tick on every countdown second
      try {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Vibration.vibrate(150);
        }
      } catch (_) {}

      // Number bounce animation on tick
      numberScale.setValue(1.4);
      Animated.spring(numberScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();

      // Pulsing alert ring
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
  }, [visible, remainingSeconds]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: theme.colors.card }]}>
          {/* Pulsing Outer Ring */}
          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: theme.colors.error,
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseOpacity,
                },
              ]}
            />
            <View style={[styles.centerCircle, { backgroundColor: theme.colors.error }]}>
              <Animated.Text
                style={[
                  styles.countdownNumber,
                  {
                    color: theme.colors.textInverse,
                    transform: [{ scale: numberScale }],
                  },
                ]}
              >
                {remainingSeconds > 0 ? remainingSeconds : '!'}
              </Animated.Text>
            </View>
          </View>

          {/* Shake Detected Header */}
          <View style={styles.badge}>
            <Icon name="bell" size={16} color={theme.colors.error} />
            <Typography
              variant="caption"
              style={[styles.badgeText, { color: theme.colors.error }]}
            >
              Shake Pattern Detected
            </Typography>
          </View>

          <Typography
            variant="h2"
            align="center"
            style={[styles.title, { color: theme.colors.textPrimary }]}
          >
            Emergency Alert Triggering
          </Typography>

          <Typography
            variant="body"
            align="center"
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            SOS will activate in{' '}
            <Typography variant="h3" color="error">
              {remainingSeconds}
            </Typography>{' '}
            seconds
          </Typography>

          <Typography
            variant="caption"
            align="center"
            style={[styles.notice, { color: theme.colors.textMuted }]}
          >
            Your live GPS location and emergency SMS alerts will be broadcast to your guardians.
          </Typography>

          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCancel}
            style={[
              styles.cancelButton,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Icon name="close" size={20} color={theme.colors.textPrimary} />
            <Typography
              variant="h3"
              style={[styles.cancelText, { color: theme.colors.textPrimary }]}
            >
              CANCEL
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 24,
  },
  animationContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  countdownNumber: {
    fontSize: 40,
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginBottom: 12,
  },
  badgeText: {
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    marginBottom: 8,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 12,
  },
  notice: {
    marginBottom: 24,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    marginLeft: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
