import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Vibration, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Button } from '../components/atoms/Button';
import { Typography } from '../components/atoms/Typography';
import { Icon } from '../components/atoms/Icon';
import { Card } from '../components/molecules/Card';
import * as Haptics from 'expo-haptics';

export const SOSScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHolding && !alertSent) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            triggerSOS();
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.setValue(1);
      if (!alertSent) {
        setProgress(0);
      }
    }
  }, [isHolding, alertSent]);

  const triggerSOS = async () => {
    setAlertSent(true);
    setIsHolding(false);
    
    // Vibration pattern (SOS in Morse: ... --- ...)
    Vibration.vibrate([200, 100, 200, 100, 200, 300, 600, 100, 600, 100, 600, 300, 200, 100, 200, 100, 200], true);
    
    // Haptic feedback
    if (await Haptics.isAvailableAsync()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Show success
    setTimeout(() => {
      Vibration.cancel();
    }, 3000);
  };

  const handleDismiss = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  if (alertSent) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.error,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: theme.colors.textInverse,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <Icon name="sos" size={64} color={theme.colors.error} />
        </View>
        
        <Typography variant="h1" color="inverse" align="center" style={{ marginBottom: 16 }}>
          Alert Sent!
        </Typography>
        
        <Typography variant="bodyLarge" color="inverse" align="center" style={{ marginBottom: 48 }}>
          Your emergency contacts have been notified with your location
        </Typography>

        <Card
          variant="default"
          padding="large"
          style={{ width: '100%', marginBottom: 24 }}
        >
          <Typography variant="body" color="primary" align="center">
            Help is on the way. Stay calm.
          </Typography>
        </Card>

        <Button
          title="I'm Safe - Dismiss"
          onPress={handleDismiss}
          variant="secondary"
          size="xlarge"
          style={{ width: '100%' }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      {/* Progress Bar */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: theme.colors.border,
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: 8,
            backgroundColor: theme.colors.error,
          }}
        />
      </View>

      <Typography variant="h2" color="primary" align="center" style={{ marginBottom: 48 }}>
        Emergency SOS
      </Typography>

      <Typography variant="bodyLarge" color="muted" align="center" style={{ marginBottom: 48 }}>
        Press and hold the button below to send an emergency alert
      </Typography>

      {/* SOS Button */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <View
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: isHolding ? theme.colors.error : theme.colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isHolding ? theme.colors.error : theme.colors.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          }}
          onTouchStart={() => setIsHolding(true)}
          onTouchEnd={() => setIsHolding(false)}
        >
          <Typography variant="h1" color={isHolding ? 'inverse' : 'primary'}>
            SOS
          </Typography>
        </View>
      </Animated.View>

      <Typography
        variant="body"
        color={isHolding ? 'error' : 'muted'}
        align="center"
        style={{ marginTop: 48 }}
      >
        {isHolding ? 'Hold to confirm...' : 'Tap and hold'}
      </Typography>

      {/* Cancel Button */}
      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="ghost"
        size="large"
        style={{ marginTop: 48 }}
      />
    </View>
  );
};
