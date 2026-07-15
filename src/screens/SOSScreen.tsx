import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Vibration, Alert, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { EmergencyDashboard } from '../components/organisms';
import { AuthContext } from '../context/AuthContext';
import { AlertTriggerService } from '../services/AlertTriggerService';

type SOSMode = 'countdown' | 'active' | 'pin';

export const SOSScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  const [mode, setMode] = useState<SOSMode>('countdown');
  const [countdown, setCountdown] = useState(5);
  const [activeTime, setActiveTime] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  // HOLD to cancel tracking
  const [isHoldingCancel, setIsHoldingCancel] = useState(false);
  const [cancelProgress, setCancelProgress] = useState(0);
  const cancelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // PIN entry states
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Background audio recording simulator flag
  const [recordingSegment, setRecordingSegment] = useState(1);

  // 1. Block hardware back button on Android during SOS
  useEffect(() => {
    const backAction = () => {
      // Return true to prevent back button from doing anything
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (mode !== 'countdown') return;

    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }, 1000);
    } else {
      triggerActiveSOS();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, mode]);

  // 3. Active Time Clock Loop
  useEffect(() => {
    if (mode !== 'active') return;

    const timer = setInterval(() => {
      setActiveTime(prev => prev + 1);
      // Soft reassurance haptic tick every 5 seconds
      if ((activeTime + 1) % 5 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      
      // Simulate segment recording rotation every 10 seconds
      if ((activeTime + 1) % 10 === 0) {
        setRecordingSegment(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTime, mode]);

  // 4. Hold cancellation logic
  useEffect(() => {
    if (isHoldingCancel) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      
      cancelTimerRef.current = setInterval(() => {
        setCancelProgress(prev => {
          if (prev >= 100) {
            clearInterval(cancelTimerRef.current!);
            setIsHoldingCancel(false);
            setCancelProgress(0);
            // Hold success: transition to PIN keypad deactivation
            setMode('pin');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            return 100;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          return prev + 4; // Increases progress to 100% over ~2.5s
        });
      }, 100);
    } else {
      if (cancelTimerRef.current) {
        clearInterval(cancelTimerRef.current);
      }
      setCancelProgress(0);
    }

    return () => {
      if (cancelTimerRef.current) clearInterval(cancelTimerRef.current);
    };
  }, [isHoldingCancel]);

  const triggerActiveSOS = async () => {
    try {
      setMode('active');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      
      // Fetch current coordinates immediately to display in telemetry
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc);
      } catch (err) {
        console.warn('Could not get coordinates in SOS screen:', err);
      }

      await AlertTriggerService.triggerSOS(user);
    } catch (e: any) {
      console.error('[SOS] Failed to trigger live alerts:', e.message);
    }
  };

  const handleKeypress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (pinError) setPinError(false);

    if (key === 'DELETE') {
      setEnteredPin(prev => prev.slice(0, -1));
      return;
    }

    if (enteredPin.length < 4) {
      const newPin = enteredPin + key;
      setEnteredPin(newPin);

      // Verify PIN immediately when 4 digits are completed
      if (newPin.length === 4) {
        if (newPin === '1234') {
          // Deactivation Success
          Vibration.cancel();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          Alert.alert("SOS Resolved", "Emergency alert status defused. System returned to Ambient safe.");
          navigation.goBack();
        } else {
          // Deactivation Failure
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          setPinError(true);
          setEnteredPin('');
        }
      }
    }
  };

  // Pre-configured overlay elements
  const keyItems = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '0', 'DELETE'];

  // COUNTDOWN RENDER
  if (mode === 'countdown') {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.error }]}>
        <View style={styles.contentWrapper}>
          <EmergencyDashboard
            countdown={countdown}
            isCountdownMode={true}
            onCancelCountdown={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.goBack();
            }}
            isHoldingCancel={false}
            cancelProgress={0}
            onHoldStart={() => {}}
            onHoldEnd={() => {}}
          />
        </View>
      </View>
    );
  }

  // PIN KEYPAD DEACTIVATION RENDER
  if (mode === 'pin') {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
        <View style={styles.contentWrapper}>
          <Typography variant="h2" color="primary" align="center" weight="700" style={{ marginBottom: 8 }}>
            Enter Safety PIN
          </Typography>
          <Typography variant="bodySmall" color={pinError ? "error" : "secondary"} align="center" style={{ marginBottom: 24, fontWeight: pinError ? '600' : '400' }}>
            {pinError ? "Incorrect deactivation PIN. Try again." : "Verify security PIN to stand down alert."}
          </Typography>

          {/* PIN Indicators Row */}
          <View style={styles.pinIndicatorsRow}>
            {[0, 1, 2, 3].map(index => {
              const hasDigit = enteredPin.length > index;
              return (
                <View 
                  key={index}
                  style={[
                    styles.pinDot,
                    { 
                      backgroundColor: hasDigit ? theme.colors.primary : 'transparent',
                      borderColor: pinError ? theme.colors.error : theme.colors.border,
                    }
                  ]}
                />
              );
            })}
          </View>

          {/* Custom Grid Pad */}
          <View style={styles.keypadGrid}>
            {keyItems.map((key, index) => {
              if (key === ' ') {
                return <View key={index} style={styles.keypadCell} />;
              }
              const isDelete = key === 'DELETE';
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleKeypress(key)}
                  activeOpacity={0.7}
                  style={[styles.keypadCell, { backgroundColor: theme.colors.backgroundSecondary }]}
                  accessibilityLabel={isDelete ? "Backspace" : `Number ${key}`}
                  accessibilityRole="button"
                >
                  {isDelete ? (
                    <Icon name="close" size={20} color={theme.colors.error} />
                  ) : (
                    <Typography variant="h3" color="primary" weight="600">
                      {key}
                    </Typography>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="Return to SOS Console"
            onPress={() => setMode('active')}
            variant="ghost"
            size="medium"
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  // ACTIVE BROADCAST CONSOLE RENDER
  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.error }]}>
      <View style={styles.contentWrapper}>
        <EmergencyDashboard
          activeTime={activeTime}
          location={location}
          recordingSegment={recordingSegment}
          isHoldingCancel={isHoldingCancel}
          cancelProgress={cancelProgress}
          onHoldStart={() => setIsHoldingCancel(true)}
          onHoldEnd={() => setIsHoldingCancel(false)}
          isCountdownMode={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  pinIndicatorsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 36,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'space-between',
    gap: 12,
  },
  keypadCell: {
    width: 80,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
