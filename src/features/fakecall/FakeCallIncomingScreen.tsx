import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Icon } from '../../components/atoms';
import { ROUTES } from '../../constants';

export const FakeCallIncomingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const callerName = route.params?.callerName || 'Unknown';
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Start vibration pattern (1s on, 2s off)
    Vibration.vibrate([1000, 2000], true);

    const playRingtone = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require('../../../assets/ringtone.wav'),
          { shouldPlay: true, isLooping: true }
        );
        if (isMounted) {
          soundRef.current = newSound;
        } else {
          newSound.unloadAsync();
        }
      } catch (e) {
        console.error('Failed to play ringtone:', e);
      }
    };

    playRingtone();

    return () => {
      isMounted = false;
      Vibration.cancel();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const handleAccept = () => {
    Vibration.cancel();
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    navigation.replace(ROUTES.FAKE_CALL_ACTIVE, { callerName });
  };

  const handleDecline = () => {
    Vibration.cancel();
    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.header}>
        <Typography variant="h2" color="inverse" weight="400" style={styles.callerName}>
          {callerName}
        </Typography>
        <Typography variant="body" color="inverse" style={styles.statusText}>
          mobile
        </Typography>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="clock" size={24} color="#ffffff" />
            <Typography variant="caption" color="inverse" style={styles.actionText}>Remind Me</Typography>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="message" size={24} color="#ffffff" />
            <Typography variant="caption" color="inverse" style={styles.actionText}>Message</Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.mainActionsRow}>
          <TouchableOpacity style={[styles.callButton, styles.declineButton]} onPress={handleDecline}>
            <Icon name="phone-off" size={32} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.callButton, styles.acceptButton]} onPress={handleAccept}>
            <Icon name="phone" size={32} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Standard dark call screen background
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  callerName: {
    fontSize: 36,
    marginBottom: 8,
  },
  statusText: {
    opacity: 0.7,
  },
  actionsContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
  },
  mainActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  callButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: '#ff3b30',
  },
  acceptButton: {
    backgroundColor: '#34c759',
  },
});
