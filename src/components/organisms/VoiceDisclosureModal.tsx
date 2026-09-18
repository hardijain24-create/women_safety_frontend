import React from 'react';
import { View, Modal, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { Typography, Button, Icon } from '../../atoms';
import { useTheme } from '../../../../theme';

interface VoiceDisclosureModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const VoiceDisclosureModal: React.FC<VoiceDisclosureModalProps> = ({ visible, onAccept, onDecline }) => {
  const { theme } = useTheme();

  const handleEnable = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Guardian needs access to your microphone to listen for the "Guardian Guardian" safety phrase.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          onAccept();
        } else {
          onDecline();
        }
      } catch (err) {
        console.warn(err);
        onDecline();
      }
    } else {
      onAccept();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: theme.colors.background + 'E6' }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Icon name="mic" size={32} color={theme.colors.primary} />
          </View>
          
          <Typography variant="h3" color="primary" style={styles.title}>
            Guardian Voice SOS
          </Typography>
          
          <Typography variant="body" color="secondary" style={styles.text}>
            When enabled, Guardian will continuously listen through your microphone for the safety phrase <Typography variant="body" color="primary" weight="600">"Guardian Guardian"</Typography> to instantly trigger an emergency SOS alert hands-free.
          </Typography>

          <View style={styles.privacyBox}>
            <Typography variant="caption" color="text" weight="600" style={{ marginBottom: 4 }}>
              🔒 Your privacy is strictly protected:
            </Typography>
            <Typography variant="caption" color="muted">
              • All audio is processed locally on your device in real-time.{"\n"}
              • No audio recordings are ever saved, stored, or transmitted anywhere.{"\n"}
              • You will see a green microphone icon in your status bar while active.
            </Typography>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              title="Cancel" 
              variant="outline" 
              onPress={onDecline} 
              style={{ flex: 1, marginRight: 8 }} 
            />
            <Button 
              title="I Understand & Enable" 
              variant="primary" 
              onPress={handleEnable} 
              style={{ flex: 1, marginLeft: 8 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  privacyBox: {
    backgroundColor: '#0000000A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
