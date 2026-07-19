import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Platform, Alert as RNAlert } from 'react-native';
import { Typography } from '../components/atoms/Typography';
import { Card } from '../components/molecules/Card';
import { Button } from '../components/atoms/Button';
import { useTheme } from '../theme';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

type AlertListener = (title: string, message?: string, buttons?: AlertButton[]) => void;

let activeListener: AlertListener | null = null;

export const registerAlertListener = (listener: AlertListener) => {
  activeListener = listener;
  return () => {
    if (activeListener === listener) {
      activeListener = null;
    }
  };
};

export const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (Platform.OS !== 'web') {
    RNAlert.alert(title, message, buttons);
    return;
  }

  if (activeListener) {
    activeListener(title, message, buttons);
  } else {
    // Fallback for web if listener is not registered yet (e.g. before mounting)
    const msg = message ? `${title}\n\n${message}` : title;
    if (buttons && buttons.length > 0) {
      if (buttons.length > 1) {
        const result = window.confirm(msg);
        if (result) {
          const primaryBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];
          primaryBtn.onPress?.();
        } else {
          const cancelBtn = buttons.find(b => b.style === 'cancel') || buttons[1] || buttons[0];
          cancelBtn.onPress?.();
        }
      } else {
        window.alert(msg);
        buttons[0].onPress?.();
      }
    } else {
      window.alert(msg);
    }
  }
};

export const GlobalAlert: React.FC = () => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([]);

  useEffect(() => {
    return registerAlertListener((t, m, b) => {
      setTitle(t);
      setMessage(m || '');
      setButtons(b && b.length > 0 ? b : [{ text: 'OK' }]);
      setVisible(true);
    });
  }, []);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <Card variant="glass" padding="large" style={{ ...styles.card, borderColor: theme.colors.border }}>
          <Typography variant="h3" color="primary" style={styles.title}>
            {title}
          </Typography>
          {message ? (
            <Typography variant="body" color="secondary" style={styles.message}>
              {message}
            </Typography>
          ) : null}
          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => {
              const handlePress = () => {
                setVisible(false);
                if (btn.onPress) {
                  btn.onPress();
                }
              };

              const buttonVariant = btn.style === 'destructive'
                ? 'danger'
                : btn.style === 'cancel'
                ? 'outline'
                : 'primary';

              return (
                <View key={index} style={styles.buttonWrapper}>
                  <Button
                    title={btn.text || 'OK'}
                    onPress={handlePress}
                    variant={buttonVariant}
                    size="medium"
                    fullWidth
                  />
                </View>
              );
            })}
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  buttonWrapper: {
    flex: 1,
    minWidth: 120,
  },
});
