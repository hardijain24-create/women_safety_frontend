import React, { useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme';
import { Typography, Icon, Button } from '../../components/atoms';
import { Card } from '../../components/molecules';
import { useSOS } from '../../hooks/useSOS';
import { AuthContext } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { showAlert } from '../../utils/alert';

export const SOSScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const { vibrationEnabled } = useSettings();

  const {
    countdown,
    mode,
    activeTime,
    pin,
    pinError,
    handlePinInput,
    setMode,
    isPinConfigured,
    broadcastError,
    location,
  } = useSOS(user);


  useEffect(() => {
    // Vibrate when screen is launched (Emergency alert init)
    if (vibrationEnabled) {
      Vibration.vibrate([0, 400, 200, 400], false);
    }
  }, [vibrationEnabled]);

  const handleDeactivateSuccess = () => {
    showAlert('SOS Resolved', 'Emergency alert resolved. Returning to Ambient Protect mode.');
    navigation.goBack();
  };

  const renderCountdown = () => (
    <View style={styles.countdownContainer}>
      <View style={styles.glowRingOuter}>
        <View style={styles.glowRingInner}>
          <View style={[styles.sosCircle, { backgroundColor: theme.colors.error, borderColor: theme.colors.errorDark }]}>
            <Typography variant="emergencyLarge" style={{ color: '#FFFFFF', fontWeight: '800' }}>
              {countdown}
            </Typography>
          </View>
        </View>
      </View>
      
      <Typography variant="h2" color="primary" weight="500" style={{ marginTop: 40, marginBottom: 8 }} align="center">
        Are you in an emergency?
      </Typography>
      <Typography variant="bodySmall" color="secondary" align="center" style={{ paddingHorizontal: 32 }}>
        Sending emergency alert broadcast in {countdown} seconds...
      </Typography>

      <Button
        title="Cancel"
        onPress={() => {
          if (vibrationEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          navigation.goBack();
        }}
        variant="ghost"
        textStyle={{ color: theme.colors.error, fontWeight: '700' }}
        style={{ marginTop: 24 }}
      />
    </View>
  );


  const renderActiveSOS = () => (
    <View style={styles.activeContainer}>
      <Typography variant="h2" style={{ color: theme.colors.error, fontWeight: '700', letterSpacing: -0.2, marginBottom: 8 }}>
        {broadcastError ? 'LOCAL ALARM ACTIVE' : 'SOS BROADCAST ACTIVE'}
      </Typography>

      <Typography variant="emergencyLarge" style={{ color: theme.colors.error, fontSize: 56, fontWeight: '700', marginBottom: 20 }}>
        {Math.floor(activeTime / 60)}:{(activeTime % 60).toString().padStart(2, '0')}
      </Typography>

      {broadcastError && (
        <View style={[styles.errorHUD, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '30' }]}>
          <Icon name="close" size={14} color={theme.colors.error} containerStyle={{ marginRight: 6 }} />
          <Typography variant="caption" style={{ color: theme.colors.error, fontWeight: '700', textAlign: 'center' }}>
            {broadcastError}
          </Typography>
        </View>
      )}

      <Card variant="glass" padding="medium" style={styles.hudCard}>
        <View style={styles.bulletRow}>
          <Icon name={location ? "check" : "close"} size={16} color={location ? theme.colors.success : theme.colors.error} />
          <Typography variant="bodySmall" color="primary">
            {location ? "GPS coordinates locked" : "Locating GPS coordinates..."}
          </Typography>
        </View>
        <View style={styles.bulletRow}>
          <Icon name={broadcastError ? "close" : "check"} size={16} color={broadcastError ? theme.colors.error : theme.colors.success} />
          <Typography variant="bodySmall" color="primary">
            {broadcastError ? "Emergency message failed to send" : "Emergency message sent"}
          </Typography>
        </View>
      </Card>

      <Button
        title="I'm Safe — Enter PIN"
        onPress={() => {
          setMode('pin');
        }}
        variant="danger"
        style={{ width: 280, borderRadius: 30, height: 60 }}
      />
    </View>
  );


  const renderPinPad = () => (
    <View style={styles.pinContainer}>
      <Typography variant="h3" color="primary" weight="600" style={{ marginBottom: 4 }}>
        Enter Safety PIN
      </Typography>
      <Typography variant="caption" color={pinError ? 'error' : 'secondary'} style={{ marginBottom: 24, fontWeight: '600', textAlign: 'center' }}>
        {pinError 
          ? 'Incorrect PIN. Try again.' 
          : isPinConfigured 
            ? 'Enter deactivation PIN to defuse emergency status.' 
            : 'No Safety PIN set. Enter any 4 digits to defuse emergency status.'}
      </Typography>


      {/* Dots */}
      <View style={styles.pinIndicatorRow}>
        {[0, 1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={[
              styles.pinDot,
              {
                backgroundColor: pin.length > idx ? theme.colors.primary : 'transparent',
                borderColor: pinError ? theme.colors.error : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Grid */}
      <View style={styles.keypadGrid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '0', 'DELETE'].map((key, idx) => {
          if (key === ' ') return <View key={idx} style={styles.keypadCell} />;
          const isDelete = key === 'DELETE';
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => handlePinInput(key, handleDeactivateSuccess)}
              activeOpacity={0.7}
              style={[styles.keypadCell, { backgroundColor: theme.colors.backgroundSecondary }]}
            >
              {isDelete ? (
                <Icon name="close" size={18} color={theme.colors.error} />
              ) : (
                <Typography variant="h3" color="primary" weight="600">{key}</Typography>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Return to SOS"
        onPress={() => setMode('active')}
        variant="ghost"
        size="medium"
        style={{ marginTop: 24 }}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {mode === 'countdown' && renderCountdown()}
      {mode === 'active' && renderActiveSOS()}
      {mode === 'pin' && renderPinPad()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  glowRingOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(240, 113, 103, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingInner: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(240, 113, 103, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F07167',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  countdownDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 12,
  },
  activeContainer: {
    alignItems: 'center',
    width: '100%',
  },
  activeTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 28,
  },
  errorHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    maxWidth: 320,
    width: '100%',
  },
  hudCard: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 40,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  holdButton: {
    width: 280,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  holdText: {
    color: '#FFFFFF',
    zIndex: 1,
  },
  pinContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  pinIndicatorRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 270,
    justifyContent: 'space-between',
    gap: 10,
  },
  keypadCell: {
    width: 78,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
