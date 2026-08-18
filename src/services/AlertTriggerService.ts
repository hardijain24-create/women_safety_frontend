import { Platform, Vibration, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { alertApi } from '../api/services';

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

      // 📍 Get REAL location (graceful failure — SOS must not abort if GPS fails)
      let latitude = 0;
      let longitude = 0;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        } else {
          console.warn('[SOS] Location permission denied, sending alert without coordinates.');
        }
      } catch (locErr) {
        console.warn('[SOS] GPS fetch failed, sending alert without coordinates.', locErr);
      }

      const mapsLink = (latitude !== 0 || longitude !== 0)
        ? `https://maps.google.com/?q=${latitude},${longitude}`
        : 'Location unavailable';

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

          const message = `🚨 EMERGENCY ALERT 🚨\n\n${user.name || 'Someone'} may be in danger!\n\n📍 Location:\n${mapsLink}\n\nPlease act immediately.`;
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              let directSentCount = 0;
              for (const contact of user.emergency_contacts) {
                if (contact.phone) {
                  try {
                    if (SmsSender) {
                      await SmsSender.sendDirectSMS(contact.phone, message);
                      directSentCount++;
                    } else {
                      throw new Error('SmsSender native module not available');
                    }
                  } catch (smsError) {
                    console.log(`Direct SMS failed for ${contact.phone}:`, smsError);
                    // Intent fallback — do NOT count as sent (requires manual tap)
                    try {
                      if (SmsSender) {
                        await SmsSender.openSMSIntent(contact.phone, message);
                      }
                    } catch (intentError) {
                      console.log(`Intent SMS also failed for ${contact.phone}`, intentError);
                    }
                  }
                }
              }
              if (directSentCount > 0) {
                skipTwilioSms = true;
              }
            }
          } else {
            // Permission denied — try a single Intent SMS (no permission needed)
            console.log("SMS permission denied. Trying Intent-based SMS...");
            if (user.emergency_contacts && user.emergency_contacts.length > 0) {
              const firstContact = user.emergency_contacts.find(c => c.phone);
              if (firstContact?.phone) {
                try {
                  if (SmsSender) {
                    await SmsSender.openSMSIntent(firstContact.phone, message);
                  }
                  // Don't skip Twilio — Intent SMS needs manual user tap
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

      // Trigger Backend Alert (always fires, even with lat/lng of 0)
      await alertApi.triggerAlert({
        user_id: user.id,
        latitude,
        longitude,
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

