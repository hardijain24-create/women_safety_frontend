import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from '../atoms';

interface DisclosureModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const DisclosureModal: React.FC<DisclosureModalProps> = ({ visible, onAccept, onDecline }) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Important Privacy Disclosure</Text>
          <ScrollView style={styles.scrollArea}>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Guardian Band is a physical safety application designed to protect you during emergencies. 
              To function correctly, it requires the following sensitive permissions:
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>1. Background Location</Text>
            <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
              Guardian Band collects location data to enable live location sharing with your emergency contacts when you press the physical SOS button, even when the app is closed or not in use.
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>2. SMS & Phone Calls</Text>
            <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
              Guardian Band needs permission to send SMS messages and make phone calls. This is strictly used to automatically alert your pre-configured emergency contacts when an SOS is triggered.
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>3. Bluetooth</Text>
            <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
              Bluetooth is required to maintain a secure connection with your Guardian Band wearable device.
            </Text>

            <Text style={[styles.text, { color: theme.colors.text, marginTop: 10, fontWeight: 'bold' }]}>
              We do not sell this data. It is used exclusively for your physical safety.
            </Text>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onDecline} style={styles.declineButton}>
              <Text style={[styles.declineText, { color: theme.colors.textSecondary }]}>Decline</Text>
            </TouchableOpacity>
            <Button title="I Understand & Agree" onPress={onAccept} variant="primary" style={styles.acceptBtn} />
          </View>
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
    padding: 20,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollArea: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  declineButton: {
    padding: 12,
    marginRight: 16,
  },
  declineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
  },
});
