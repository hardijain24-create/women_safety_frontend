import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { AlertTriggerService } from '../services/AlertTriggerService';
import { useSettings } from '../context/SettingsContext';
import { showAlert } from '../utils/alert';

export const useSOS = (user: any) => {
  const [countdown, setCountdown] = useState(3);
  const [mode, setMode] = useState<'countdown' | 'active' | 'pin'>('countdown');
  const [activeTime, setActiveTime] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isHoldingCancel, setIsHoldingCancel] = useState(false);
  const [cancelProgress, setCancelProgress] = useState(0);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);

  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { vibrationEnabled } = useSettings();

  // Countdown timer loop
  useEffect(() => {
    if (mode !== 'countdown') return;

    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
        if (vibrationEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        }
      }, 1000);
    } else {
      triggerSOS();
    }

    return () => clearTimeout(timer);
  }, [countdown, mode, vibrationEnabled]);

  // Active time timer loop
  useEffect(() => {
    if (mode !== 'active') return;

    const timer = setInterval(() => {
      setActiveTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode]);

  // Hold cancellation progress loop
  useEffect(() => {
    if (isHoldingCancel) {
      if (vibrationEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      cancelTimerRef.current = setInterval(() => {
        setCancelProgress((prev) => {
          if (prev >= 100) {
            clearInterval(cancelTimerRef.current!);
            setIsHoldingCancel(false);
            setMode('pin');
            if (vibrationEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
            return 100;
          }
          if (vibrationEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          return prev + 4;
        });
      }, 100);
    } else {
      if (cancelTimerRef.current) clearInterval(cancelTimerRef.current);
      setCancelProgress(0);
    }

    return () => {
      if (cancelTimerRef.current) clearInterval(cancelTimerRef.current);
    };
  }, [isHoldingCancel, vibrationEnabled]);

  const triggerSOS = async () => {
    setMode('active');
    setBroadcastError(null);
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);
    } catch (err) {
      console.warn('Could not get coordinates in SOS hook:', err);
    }
    try {
      await AlertTriggerService.triggerSOS(user);
    } catch (err: any) {
      console.error('[useSOS] AlertTriggerService.triggerSOS failed:', err);
      setBroadcastError(err.message || 'Could not reach server — local alarm only');
    }
  };

  const cancelCountdown = () => {
    setCountdown(3);
    setMode('countdown');
  };

  const configuredPin = user?.safety_pin || user?.deactivation_pin;
  const isPinConfigured = !!configuredPin;

  const handlePinInput = (digit: string, onSuccess: () => void) => {
    if (pinError) setPinError(false);

    if (digit === 'DELETE') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 4) {
        if (!isPinConfigured) {
          // Fallback: no PIN is configured, any 4 digits will succeed to prevent lockout.
          if (vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
          setPin('');
          setMode('countdown');
          setCountdown(3);
          onSuccess();
          showAlert(
            'Security Warning',
            'No emergency deactivation PIN is configured for your profile. Please configure a safety PIN in settings to secure your device.'
          );
        } else if (nextPin === configuredPin) {
          if (vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
          setPin('');
          setMode('countdown');
          setCountdown(3);
          onSuccess();
        } else {
          if (vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          }
          setPinError(true);
          setPin('');
        }
      }
    }
  };

  return {
    countdown,
    mode,
    activeTime,
    location,
    pin,
    pinError,
    isHoldingCancel,
    cancelProgress,
    setIsHoldingCancel,
    cancelCountdown,
    handlePinInput,
    setMode,
    isPinConfigured,
    broadcastError,
  };
};
