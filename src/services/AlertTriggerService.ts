import { Platform, Vibration, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { alertApi } from '../api/services';
import { showAlert } from '../utils/alert';

import { SmsSender } from '../../modules/sms-sender';

type User = {
  id: string;
  name?: string;
  emergency_contacts?: { phone: string; email: string; name: string }[];
  [key: string]: any;
};

export const AlertTriggerService = {
  async triggerSOS(user: User | null): Promise<void> {
    // Start local alarm feedback instantly
    this.playSOSFeedback();

    try {
      if (!user?.id) {
        console.warn("User not found, proceeding with local SOS actions.");
        throw new Error("Could not reach server — local alarm only");
      }


      // 📍 Get REAL location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Location permission is required to send SOS.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      let skipTwilioSms = false;

      // Try Direct SMS on Android
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
            {
              title: 'SMS Permission Required',
              message: 'We need permission to send emergency SMS directly from your phone.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const message = `🚨 EMERGENCY ALERT 🚨\n\n${user.name || 'Someone'} may be in danger!\n\n📍 Location:\nhttps://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}\n\nPlease act immediately.`;
            
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              let sentCount = 0;
              for (const contact of user.emergency_contacts) {
                if (contact.phone) {
                  try {
                    if (SmsSender) {
                      await SmsSender.sendDirectSMS(contact.phone, message);
                      sentCount++;
                    } else {
                      throw new Error('SmsSender native module not available');
                    }
                  } catch (smsError) {
                    console.log(`Direct SMS failed for ${contact.phone}, trying Intent...`, smsError);
                    // Fall back to opening SMS app pre-filled
                    try {
                      if (SmsSender) {
                        await SmsSender.openSMSIntent(contact.phone, message);
                        sentCount++;
                      } else {
                        console.log(`Intent SMS failed for ${contact.phone}: SmsSender native module not available`);
                      }
                    } catch (intentError) {
                      console.log(`Intent SMS also failed for ${contact.phone}`, intentError);
                    }
                  }
                }
              }
              if (sentCount > 0) {
                skipTwilioSms = true;
              }
            }
          } else {
            // Permission denied — try Intent SMS (no permission needed)
            console.log("SMS permission denied. Trying Intent-based SMS...");
            const message = `🚨 EMERGENCY ALERT 🚨\n\n${user.name || 'Someone'} may be in danger!\n\n📍 Location:\nhttps://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}\n\nPlease act immediately.`;
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              const firstContact = user.emergency_contacts.find(c => c.phone);
              if (firstContact?.phone) {
                try {
                  if (SmsSender) {
                    await SmsSender.openSMSIntent(firstContact.phone, message);
                  } else {
                    console.log("Intent SMS failed: SmsSender native module not available");
                  }
                  // Don't skip Twilio — Intent SMS needs manual user tap, others won't get it
                } catch (e) {
                  console.log("Intent SMS also failed", e);
                }
              }
            }
          }
        } catch (e) {
          console.log("Direct SMS failed or permission denied, falling back to Twilio", e);
        }
      }

      // Trigger Backend Alert
      await alertApi.triggerAlert({
        user_id: user.id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        skip_sms: skipTwilioSms,
      });
      
    } catch (e: any) {

      throw new Error(e.response?.data?.message || e.message);
    }
  },

  async playSOSFeedback() {
    try {
      const storedVib = await AsyncStorage.getItem('settings_vibration');
      const vibrationEnabled = storedVib !== 'false';
      if (!vibrationEnabled) {
        console.log('[AlertTriggerService] playSOSFeedback skipped: vibrationEnabled is false');
        return;
      }
    } catch (err) {
      console.error('Error loading settings in playSOSFeedback:', err);
    }

    // Vibration pattern (SOS in Morse: ... --- ...)
    Vibration.vibrate([200, 100, 200, 100, 200, 300, 600, 100, 600, 100, 600, 300, 200, 100, 200, 100, 200], true);
    
    // Haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (_) {}

    setTimeout(() => {
      Vibration.cancel();
    }, 3000);
  }
};

