import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Icon } from '../../components/atoms';

export const FakeCallActiveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const callerName = route.params?.callerName || 'Unknown';

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.header}>
        <Typography variant="h2" color="inverse" weight="400" style={styles.callerName}>
          {callerName}
        </Typography>
        <Typography variant="body" color="inverse" style={styles.timerText}>
          {formatTime(secondsElapsed)}
        </Typography>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlGrid}>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="mic-off" size={32} color="#ffffff" />
              <Typography variant="caption" color="inverse" style={styles.controlText}>mute</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="grid" size={32} color="#ffffff" />
              <Typography variant="caption" color="inverse" style={styles.controlText}>keypad</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="volume" size={32} color="#ffffff" />
              <Typography variant="caption" color="inverse" style={styles.controlText}>speaker</Typography>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="add" size={32} color="#ffffff" />
              <Typography variant="caption" color="inverse" style={styles.controlText}>add call</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="video" size={32} color="#ffffff" containerStyle={{ opacity: 0.5 }} />
              <Typography variant="caption" color="inverse" style={{ marginTop: 8, fontSize: 12, opacity: 0.5 }}>FaceTime</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="profile" size={32} color="#ffffff" />
              <Typography variant="caption" color="inverse" style={styles.controlText}>contacts</Typography>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Icon name="phone-off" size={32} color="#ffffff" />
        </TouchableOpacity>
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
  timerText: {
    opacity: 0.7,
    fontSize: 18,
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  controlGrid: {
    width: '80%',
    marginBottom: 60,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  controlButton: {
    alignItems: 'center',
    width: 70,
  },
  controlText: {
    marginTop: 8,
    fontSize: 12,
  },
  endCallButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
